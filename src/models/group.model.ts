export interface GroupModel {
    name?: string;
    type?: string;
    image?: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
    create_user?: string;
    group_users?: string[];
    description?: string;
    group_id?: string;
}

export interface UserGroupRelation {
    groupId?: string;
    userId?: string;
    created_at?: string;
    status?: string;
    groupName?: string;
    id?: string;
    create_user?: string;
    fromUser?: string;
}