export interface SurveyModel {
    message?: string;
    image?: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
    groupId?: string;
    userId?: string;
    type?: string;
    comments?: Comment[];
    answers?: string[];
    poll1?: string;
    poll2?: string;
    poll1Img?: string;
    poll2Img?: string;
}

export interface Comment {
    created_at?: string;
    userId?: string;
    userName?: string;
    comment?: string;
}