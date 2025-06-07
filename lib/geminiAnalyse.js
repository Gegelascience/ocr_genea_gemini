const modeGemini = Object.freeze({
    global: "global",
    bapteme: "bapteme",
    deces:"deces",
    mariage: "mariage",
    naissance: "naissance",
    custom: "custom"
});



function cleanGeminiHtml(html, selector) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const div = doc.querySelector(selector);
    const data = div ? div.innerHTML : html;
    return data.replaceAll("\n\n","\n").replaceAll("\n", "<br>"); // Replace newlines with <br> for better formatting
}

function getPromptIA(keyword, langage){
    if (keyword.length === 0){
        return `Extract the text. The text is in theses langages: ${langage}.` 

    } else {
        return `Extract paragraphs where text contains the keyword ${keyword}. The text is in The text is in theses langages: ${langage}.`

    }
}

function getSystemPrompt(mode) {
    const systemPrompt = [{"text":"You are a helpful assistant that extracts text from images."}];

    if (mode === modeGemini.custom || mode === modeGemini.global) {
        systemPrompt.push({
            "text":"You will answer in html format on a div tag. div tag will have the css class 'geminiAnswer'.\
            The div contains formated text on html format."
        });
    }
    return systemPrompt;
}

function getPromptFormatedAnswer(mode) {

    if (mode === modeGemini.mariage) {
        return  {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "paragraphs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "date": { "type": "string" },
                                    "groom": { "type": "string" },
                                    "bride": { "type": "string" },
                                    "fatherGroom": { "type": "string" },
                                    "motherGroom": { "type": "string" },
                                    "motherBride": { "type": "string" },
                                    "fatherBride": { "type": "string" },
                                    "witnesses": { "type": "string" },
                                    "place": { "type": "string" },
                                    "otherthings": { "type": "string" }
                                },
                                "required": ["groom", "bride"]
                            }
                        }
                    },
                    "required": ["paragraphs"]
                }
        }
    } else if (mode === modeGemini.naissance) {
        return  {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "paragraphs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "born": { "type": "string" },
                                    "date": { "type": "string" },
                                    "father": { "type": "string" },
                                    "mother": { "type": "string" },
                                    "place": { "type": "string" },
                                    "otherthings": { "type": "string" }
                                },
                                "required": ["born"]
                            }
                        }
                    },
                    "required": ["paragraphs"]
                }
        }

        
    } else if (mode === modeGemini.deces) {
        return  {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "paragraphs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "deceased": { "type": "string" },
                                    "date": { "type": "string" },
                                    "age": { "type": "string" },
                                    "spouse": { "type": "string" },
                                    "children": { "type": "string" },
                                    "father": { "type": "string" },
                                    "mother": { "type": "string" },
                                    "witnesses": { "type": "string" },
                                    "place": { "type": "string" },
                                    "otherthings": { "type": "string" }
                                },
                                "required": ["deceased"]
                            }
                        }
                    },
                    "required": ["paragraphs"]
                }
        }

        
    } else {
        return  {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "paragraphs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "baptized": { "type": "string" },
                                    "date": { "type": "string" },
                                    "father": { "type": "string" },
                                    "mother": { "type": "string" },
                                    "godmother": { "type": "string" },
                                    "godfather": { "type": "string" },
                                    "place": { "type": "string" },
                                    "otherthings": { "type": "string" }
                                },
                                "required": ["baptized"]
                            }
                        }
                    },
                    "required": ["paragraphs"]
                }
            }
    }
    
}


export class GeminiLogAnalyseClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async analyseArchiveGemini(model,fileData, keyword, langage, mode) {

        
        const payload = {
            "system_instruction":{
                "parts":getSystemPrompt(mode),
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
                            "text": getPromptIA(keyword,langage)
                        }
                ]
            }
        };

        if (mode !== modeGemini.global && mode !== modeGemini.custom) {
            payload["generationConfig"] =getPromptFormatedAnswer(mode);
        }

        
            
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
        
        if (mode !== modeGemini.global && mode !== modeGemini.custom) {
            const jsonTableData = JSON.parse(dataGemini.candidates[0].content.parts[0].text)
            if (mode === modeGemini.mariage) {
                return this.formatMarriageTable(jsonTableData);
            } else if (mode === modeGemini.naissance) {
                return this.formatBirthTable(jsonTableData);
            } else if (mode === modeGemini.deces) {
                return this.formatDeathTable(jsonTableData);
            } else {
                return this.formatBaptismTable(jsonTableData);
            }
        }

        return cleanGeminiHtml(dataGemini.candidates[0].content.parts[0].text,'.geminiAnswer');
            
    
    }

    formatMarriageTable(jsonTableData) {
        return `<div class="geminiAnswer">
            <table class="table table-hover table-secondary">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Époux</th>
                        <th>Épouse</th>
                        <th>Père de l'époux</th>
                        <th>Mère de l'époux</th>
                        <th>Mère de l'épouse</th>
                        <th>Père de l'épouse</th>
                        <th>Témoins</th>
                        <th>Lieu</th>
                        <th>Autres</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonTableData.paragraphs.map((paragraph) => {
                        return `<tr>
                            <td>${paragraph.date}</td>
                            <td>${paragraph.groom}</td>
                            <td>${paragraph.bride}</td>
                            <td>${paragraph.fatherGroom}</td>
                            <td>${paragraph.motherGroom}</td>
                            <td>${paragraph.motherBride}</td>
                            <td>${paragraph.fatherBride}</td>
                            <td>${paragraph.witnesses}</td>
                            <td>${paragraph.place}</td>
                            <td>${paragraph.otherthings}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>`;
    }

    formatBirthTable(jsonTableData) {
        return `<div class="geminiAnswer">
            <table class="table table-hover table-secondary">
                <thead>
                    <tr>
                        <th>Né</th>
                        <th>Date</th>
                        <th>Père</th>
                        <th>Mère</th>
                        <th>Lieu</th>
                        <th>Autres</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonTableData.paragraphs.map((paragraph) => {
                        return `<tr>
                            <td>${paragraph.born}</td>
                            <td>${paragraph.date}</td>
                            <td>${paragraph.father}</td>
                            <td>${paragraph.mother}</td>
                            <td>${paragraph.place}</td>
                            <td>${paragraph.otherthings}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>`;
    }

    formatDeathTable(jsonTableData) {
        return `<div class="geminiAnswer">
            <table class="table table-hover table-secondary">
                <thead>
                    <tr>
                        <th>Décédé</th>
                        <th>Date</th>
                        <th>Âge</th>
                        <th>Conjoint(e)</th>
                        <th>Enfants</th>
                        <th>Père</th>
                        <th>Mère</th>
                        <th>Témoins</th>
                        <th>Lieu</th>
                        <th>Autres</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonTableData.paragraphs.map((paragraph) => {
                        return `<tr>
                            <td>${paragraph.deceased}</td>
                            <td>${paragraph.date}</td>
                            <td>${paragraph.age}</td>
                            <td>${paragraph.spouse}</td>
                            <td>${paragraph.children}</td>
                            <td>${paragraph.father}</td>
                            <td>${paragraph.mother}</td>
                            <td>${paragraph.witnesses}</td>
                            <td>${paragraph.place}</td>
                            <td>${paragraph.otherthings}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>`;
    }

    formatBaptismTable(jsonTableData) {
        return `<div class="geminiAnswer">
            <table class="table table-hover table-secondary">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Baptisé</th>
                        <th>Père</th>
                        <th>Mère</th>
                        <th>Marraine</th>
                        <th>Parrain</th>
                        <th>Lieu</th>
                        <th>Autres</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonTableData.paragraphs.map((paragraph) => {
                        return `<tr>
                            <td>${paragraph.date}</td>
                            <td>${paragraph.baptized}</td>
                            <td>${paragraph.father}</td>
                            <td>${paragraph.mother}</td>
                            <td>${paragraph.godmother}</td>
                            <td>${paragraph.godfather}</td>
                            <td>${paragraph.place}</td>
                            <td>${paragraph.otherthings}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>`;
    }

    
}

