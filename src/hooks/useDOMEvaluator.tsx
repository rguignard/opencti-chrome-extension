import {useState} from "react";
import {ActionType, MessageTypes} from "../chromeServices/types";
import {getAllRegexMatches} from "../Utils";

const useDomEvaluator = <T extends ActionType>(type: MessageTypes) => {

    const [result, setResult] = useState<T["response"]>(undefined);

    const evaluate = (
        payload?: T["payload"],
    ): Promise<T["response"]> =>
        new Promise((resolve, reject) => {
            if (chrome.tabs) {
                chrome.tabs.query(
                    {
                        active: true,
                        currentWindow: true,
                    },
                    (tabs) => {
                        chrome.tabs.sendMessage(
                            tabs[0].id || 0,
                            { type, payload },
                            async (response: ResponseType | T["response"]) => {
                                let items: any[] = [];
                                let content = {'title': tabs[0].title, 'url': tabs[0].url, 'items': items};
                                let matches = getAllRegexMatches(response);
                                for (const match of matches) {
                                    match['state'] = 'pending';
                                    items.push(match);
                                }
                                content['items'] = items;
                                setResult(content);
                                resolve(content);
                            },
                        );
                    },
                );
            } else {
                reject();
            }
        });
    return { evaluate, result };
};
export default useDomEvaluator;
