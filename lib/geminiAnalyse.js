


function cleanGeminiHtml(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector(selector);
    const data = div ? div.innerHTML : html;
    return data.replaceAll("\n\n","\n").replaceAll("\n", "<br>"); // Replace newlines with <br> for better formatting
}

function getRequestIA(keyword, langage){
    if (keyword.length === 0){
        return `Extract the text. The text is in theses langages: ${langage}.` 

    } else {
        return `Extract paragraphs where text contains the keyword ${keyword}. The text is in The text is in theses langages: ${langage}.`

    }
}


export class GeminiLogAnalyseClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async analyseArchiveGemini(model,fileData, keyword, langage) {

        
        const payload = {
            "system_instruction":{
                "parts":[
                    {
                        "text":"You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'.\
                        The div contains formated text on html format."
                    },
                ],
            },
            "contents": {
                "parts":[
                        {
                            "inline_data": {
                                "mime_type":"image/png",
                                "data": fileData 
                            }
                        },
                        {
                            "text": getRequestIA(keyword,langage)
                        }
                ]
            }
        };
        
            
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?` + new URLSearchParams({
            key: this.apiKey
        }).toString();
    
        const response =await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dataGemini =await response.json()
        console.log("dataGemini", dataGemini)
        

        return cleanGeminiHtml(dataGemini.candidates[0].content.parts[0].text,'.geminiAnswer');
            
    
    } 

    
}

