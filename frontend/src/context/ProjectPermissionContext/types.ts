import { ForcedSubject, MongoAbility } from "@casl/ability";

export enum ProjectPermissionActions {
  Read = "read",
  Create = "create",
  Edit = "edit",
  Delete = "delete"
}

export enum ProjectPermissionCmekActions {
  Read = "read",
  Create = "create",
  Edit = "edit",
  Delete = "delete",
  Encrypt = "encrypt",
  Decrypt = "decrypt"
}

export enum PermissionConditionOperators {
  $IN = "$in",
  $ALL = "$all",
  $REGEX = "$regex",
  $EQ = "$eq",
  $NEQ = "$neq",
  $GLOB = "$glob"
}

export type TPermissionConditionOperators = {
  [PermissionConditionOperators.$IN]: string[];
  [PermissionConditionOperators.$ALL]: string[];
  [PermissionConditionOperators.$EQ]: string;
  [PermissionConditionOperators.$NEQ]: string;
  [PermissionConditionOperators.$REGEX]: string;
  [PermissionConditionOperators.$GLOB]: string;
};

export type TPermissionCondition = Record<
  string,
  | string
  | { $in: string[]; $all: string[]; $regex: string; $eq: string; $neq: string; $glob: string }
>;

export enum ProjectPermissionSub {
  Role = "role",
  Member = "member",
  Groups = "groups",
  Settings = "settings",
  Integrations = "integrations",
  Webhooks = "webhooks",
  ServiceTokens = "service-tokens",
  Environments = "environments",
  Tags = "tags",
  AuditLogs = "audit-logs",
  IpAllowList = "ip-allowlist",
  Workspace = "workspace",
  Secrets = "secrets",
  SecretFolders = "secret-folders",
  SecretRollback = "secret-rollback",
  SecretApproval = "secret-approval",
  SecretRotation = "secret-rotation",
  Identity = "identity",
  CertificateAuthorities = "certificate-authorities",
  Certificates = "certificates",
  CertificateTemplates = "certificate-templates",
  PkiAlerts = "pki-alerts",
  PkiCollections = "pki-collections",
  Kms = "kms",
  Cmek = "cmek"
}

type SubjectFields = {
  environment: string;
  secretPath: string;
};

export type ProjectPermissionSet =
  | [
      ProjectPermissionActions,
      ProjectPermissionSub.Secrets | (ForcedSubject<ProjectPermissionSub.Secrets> & SubjectFields)
    ]
  | [
      ProjectPermissionActions,
      (
        | ProjectPermissionSub.SecretFolders
        | (ForcedSubject<ProjectPermissionSub.SecretFolders> & SubjectFields)
      )
    ]
  | [ProjectPermissionActions, ProjectPermissionSub.Role]
  | [ProjectPermissionActions, ProjectPermissionSub.Tags]
  | [ProjectPermissionActions, ProjectPermissionSub.Member]
  | [ProjectPermissionActions, ProjectPermissionSub.Groups]
  | [ProjectPermissionActions, ProjectPermissionSub.Integrations]
  | [ProjectPermissionActions, ProjectPermissionSub.Webhooks]
  | [ProjectPermissionActions, ProjectPermissionSub.AuditLogs]
  | [ProjectPermissionActions, ProjectPermissionSub.Environments]
  | [ProjectPermissionActions, ProjectPermissionSub.IpAllowList]
  | [ProjectPermissionActions, ProjectPermissionSub.Settings]
  | [ProjectPermissionActions, ProjectPermissionSub.Identity]
  | [ProjectPermissionActions, ProjectPermissionSub.ServiceTokens]
  | [ProjectPermissionActions, ProjectPermissionSub.SecretApproval]
  | [ProjectPermissionActions, ProjectPermissionSub.SecretRotation]
  | [ProjectPermissionActions, ProjectPermissionSub.CertificateAuthorities]
  | [ProjectPermissionActions, ProjectPermissionSub.Certificates]
  | [ProjectPermissionActions, ProjectPermissionSub.CertificateTemplates]
  | [ProjectPermissionActions, ProjectPermissionSub.PkiAlerts]
  | [ProjectPermissionActions, ProjectPermissionSub.PkiCollections]
  | [ProjectPermissionActions.Delete, ProjectPermissionSub.Workspace]
  | [ProjectPermissionActions.Edit, ProjectPermissionSub.Workspace]
  | [ProjectPermissionActions.Read, ProjectPermissionSub.SecretRollback]
  | [ProjectPermissionActions.Create, ProjectPermissionSub.SecretRollback]
  | [ProjectPermissionCmekActions, ProjectPermissionSub.Cmek];

export type TProjectPermission = MongoAbility<ProjectPermissionSet>;
