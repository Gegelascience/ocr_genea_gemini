const modeGemini = Object.freeze({
    global: "global",
    bapteme: "bapteme",
    deces:"deces",
    mariage: "mariage",
    naissance: "naissance",
    custom: "custom",
    advanced: "advanced"
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
    const systemPrompt = [{"text":"You are a helpful assistant that extracts text from images. Answer in French if possible."}];

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

        
    } else if (mode === modeGemini.bapteme) {
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
    } else {
        return  {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "paragraphsBaptism": {
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
                        },
                        "paragraphsDeath": {
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
                        },
                        "paragraphsBorn": {
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
                        },
                        "paragraphsMariage": {
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
                    "required": ["paragraphsBaptism","paragraphsDeath","paragraphsBorn","paragraphsMariage"]
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
                return this.formatMarriageTable(jsonTableData.paragraphs);
            } else if (mode === modeGemini.naissance) {
                return this.formatBirthTable(jsonTableData.paragraphs);
            } else if (mode === modeGemini.deces) {
                return this.formatDeathTable(jsonTableData.paragraphs);
            } else if (mode === modeGemini.bapteme) {
                return this.formatBaptismTable(jsonTableData.paragraphs);
            } else {
                return this.formatAdvancedTable(jsonTableData);
            }
        }

        return cleanGeminiHtml(dataGemini.candidates[0].content.parts[0].text,'.geminiAnswer');
            
    
    }

    formatMarriageTable(paragraphs) {
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
                    ${paragraphs.map((paragraph) => {
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

    formatBirthTable(paragraphs) {
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
                    ${paragraphs.map((paragraph) => {
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

    formatDeathTable(paragraphs) {
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
                    ${paragraphs.map((paragraph) => {
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

    formatBaptismTable(paragraphs) {
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
                    ${paragraphs.map((paragraph) => {
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


    formatAdvancedTable(data) {
        return `<div class="geminiAnswer">

        <h4>Liste des baptêmes</h4>
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
                    ${data.paragraphsBaptism.map((paragraph) => {
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
            </table>

            <h4>Liste des naissances</h4>

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
                    ${data.paragraphsBorn.map((paragraph) => {
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
            </table>

            <h4>Liste des mariages</h4>

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
                    ${data.paragraphsMariage.map((paragraph) => {
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
            </table>


            <h4>Liste des décès</h4>
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
                    ${data.paragraphsDeath.map((paragraph) => {
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
            </table>

        </div>`;
    }

    
}

