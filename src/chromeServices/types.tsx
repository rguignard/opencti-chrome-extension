export enum MessageTypes {
    GET_CONTENT = "get_content",
}

export interface ActionType {
    type: MessageTypes;
    payload?: { [index: string]: any };
    response?: any;
}

export interface GetPageContent extends ActionType {
    type: MessageTypes.GET_CONTENT;
    response: any[];
}
