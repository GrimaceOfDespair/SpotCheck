export enum VersionControlChangeType {
    None = 0,
    Add = 1,
    Edit = 2,
    Encoding = 4,
    Rename = 8,
    Delete = 16,
    Undelete = 32,
    Branch = 64,
    Merge = 128,
    Lock = 256,
    Rollback = 512,
    SourceRename = 1024,
    TargetRename = 2048,
    Property = 4096,
    All = 8191
}
export interface ItemContent {
    content: string;
    contentType: ItemContentType;
}

export enum ItemContentType {
    RawText = 0,
    Base64Encoded = 1
}

export interface Change<T> {
    /**
     * The type of change that was made to the item.
     */
    changeType: VersionControlChangeType;
    /**
     * Current version.
     */
    item: T;
    /**
     * Content of the item after the change.
     */
    newContent: ItemContent;
    /**
     * Path of the item on the server.
     */
    sourceServerItem: string;
    /**
     * URL to retrieve the item.
     */
    url: string;
}

export interface GitChange extends Change<GitItem> {
    /**
     * ID of the change within the group of changes.
     */
    changeId: number;
    /**
     * New Content template to be used when pushing new changes.
     */
    newContentTemplate: GitTemplate;
    /**
     * Original path of item if different from current path.
     */
    originalPath: string;
}

export interface GitTemplate {
    /**
     * Name of the Template
     */
    name: string;
    /**
     * Type of the Template
     */
    type: string;
}

export interface GitItem extends ItemModel {
    /**
     * SHA1 of commit item was fetched at
     */
    commitId: string;
    /**
     * Type of object (Commit, Tree, Blob, Tag, ...)
     */
    gitObjectType: GitObjectType;
    /**
     * Shallow ref to commit that last changed this item Only populated if latestProcessedChange is requested May not be accurate if latest change is not yet cached
     */
    //latestProcessedChange: GitCommitRef;
    /**
     * Git object id
     */
    objectId: string;
    /**
     * Git object id
     */
    originalObjectId: string;
}

export interface ItemModel {
    _links: any;
    content: string;
    //contentMetadata: FileContentMetadata;
    isFolder: boolean;
    isSymLink: boolean;
    path: string;
    url: string;
}

export enum GitObjectType {
    Bad = 0,
    Commit = 1,
    Tree = 2,
    Blob = 3,
    Tag = 4,
    Ext2 = 5,
    OfsDelta = 6,
    RefDelta = 7
}
