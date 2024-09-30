/* eslint-disable */

import ldapjs from "ldapjs";
import { render } from "mustache";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { logger } from "@app/lib/logger";
import { alphaNumericNanoId } from "@app/lib/nanoid";

import { LdapSchema, TDynamicProviderFns } from "./models";

const ldif = require("ldif");

const generatePassword = () => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~!*$#";
  return customAlphabet(charset, 64)();
};

const generateUsername = () => {
  return alphaNumericNanoId(32);
};

const generateLDIF = ({
  username,
  password,
  ldifTemplate
}: {
  username: string;
  password?: string;
  ldifTemplate: string;
}): string => {
  const data = {
    Username: username,
    Password: password
  };

  const ldif = render(ldifTemplate, data);

  return ldif;
};

export const LdapProvider = (): TDynamicProviderFns => {
  const validateProviderInputs = async (inputs: unknown) => {
    const providerInputs = await LdapSchema.parseAsync(inputs);
    return providerInputs;
  };

  const getClient = async (providerInputs: z.infer<typeof LdapSchema>): Promise<ldapjs.Client> => {
    return new Promise((resolve) => {
      const client = ldapjs.createClient({
        url: providerInputs.url,
        tlsOptions: {
          ca: providerInputs.ca ? providerInputs.ca : null,
          rejectUnauthorized: !!providerInputs.ca
        },
        reconnect: true,
        bindDN: providerInputs.binddn,
        bindCredentials: providerInputs.bindpass,
        log: logger
      });

      client.on("error", (err) => {
        client.unbind();
        throw new Error(err.message);
      });

      client.bind(providerInputs.binddn, providerInputs.bindpass, (err) => {
        if (err) {
          client.unbind();
          throw new Error(err.message);
        } else {
          resolve(client);
        }
      });
    });
  };

  const validateConnection = async (inputs: unknown) => {
    const providerInputs = await validateProviderInputs(inputs);
    const client = await getClient(providerInputs);
    return client.connected;
  };

  const executeLdif = async (client: ldapjs.Client, ldif_file: string) => {
    const parsedEntries: any = ldif.parse(ldif_file).entries as any[];
    const dnArray: string[] = [];

    for (const entry of parsedEntries) {
      const { dn } = entry;
      let response_dn: string;

      if (entry.type === "add") {
        const attributes: any = {};

        entry.changes.forEach((change: any) => {
          const attrName = change.attribute.attribute;
          const attrValue = change.value.value;

          attributes[attrName] = Array.isArray(attrValue) ? attrValue : [attrValue];
        });

        response_dn = await new Promise((resolve) => {
          client.add(dn, attributes, (err) => {
            if (err) {
              throw new Error(err.message);
            } else {
              resolve(dn);
            }
          });
        });
      } else if (entry.type === "modify") {
        const changes: any = [];

        entry.changes.forEach((change: any) => {
          changes.push(
            new ldapjs.Change({
              operation: change.operation || "replace",
              modification: {
                [change.attribute.attribute]: Array.isArray(change.value.value)
                  ? change.value.value
                  : [change.value.value]
              }
            })
          );
        });

        response_dn = await new Promise((resolve) => {
          client.modify(dn, changes, (err) => {
            if (err) {
              throw new Error(err.message);
            } else {
              resolve(dn);
            }
          });
        });
      } else if (entry.type === "delete") {
        response_dn = await new Promise((resolve) => {
          client.del(dn, (err) => {
            if (err) {
              throw new Error(err.message);
            } else {
              resolve(dn);
            }
          });
        });
      } else {
        client.unbind();
        throw new Error(`Unsupported operation type ${entry.type}`);
      }

      dnArray.push(response_dn);
    }
    client.unbind();
    return dnArray;
  };

  const create = async (inputs: unknown) => {
    const providerInputs = await validateProviderInputs(inputs);
    const client = await getClient(providerInputs);

    const username = generateUsername();
    const password = generatePassword();
    const ldif = generateLDIF({ username, password, ldifTemplate: providerInputs.creationLdif });

    try {
      const dnArray = await executeLdif(client, ldif);

      return { entityId: username, data: { DN_ARRAY: dnArray, USERNAME: username, PASSWORD: password } };
    } catch (err) {
      const rollbackLdif = generateLDIF({ username, password, ldifTemplate: providerInputs.rollbackLdif });

      await executeLdif(client, rollbackLdif);

      throw new Error((err as Error).message);
    }
  };

  const revoke = async (inputs: unknown, entityId: string) => {
    const providerInputs = await validateProviderInputs(inputs);
    const connection = await getClient(providerInputs);
    const revocationLdif = generateLDIF({ username: entityId, ldifTemplate: providerInputs.revocationLdif });

    await executeLdif(connection, revocationLdif);

    return { entityId };
  };

  const renew = async (inputs: unknown, entityId: string) => {
    // Do nothing
    return { entityId };
  };

  return {
    validateProviderInputs,
    validateConnection,
    create,
    revoke,
    renew
  };
};
