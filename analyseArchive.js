//import {parseLogLine, getKeyword} from "./lib/utils.js";
import {GeminiLogAnalyseClient} from "./lib/geminiAnalyse.js";

function getKeyword(nameTagSearch, mode) {
    if (document.getElementsByName(nameTagSearch).length > 0) {
        const keyword = document.getElementsByName(nameTagSearch)[0].value;
        console.log("keyword", keyword)
        return mode ==="custom" && keyword ? keyword : "";
    }
    return "";
    
}

const btn = document.getElementById("resumeLog")
const spinner = document.getElementById("spinner")
const formTagElements = document.getElementById("formAnalysis").elements;

for (let index = 0; index < formTagElements["mode"].length; index++) {
    const radioBtn = formTagElements["mode"][index];
    radioBtn.addEventListener("change", () => {

        if (document.getElementsByName("keywordSearch").length > 0) {
            const inputKeyword = document.getElementsByName("keywordSearch")[0];
            if (formTagElements["mode"].value === "custom") {
                inputKeyword.hidden = false;
            } else {
                inputKeyword.hidden = true;
            }
        }
    })
}



btn.addEventListener("click", () => {

    //form check
    if (document.getElementsByName("logFile").length === 0 || document.getElementsByName("logFile")[0].files.length === 0) {
        alert("Veuillez sélectionner une image à analyser.");
        return;
    }

    if (formTagElements["mode"].value === "custom" && document.getElementsByName("keywordSearch").length > 0 && document.getElementsByName("keywordSearch")[0].value === "") {
        alert("Veuillez entrer un mot clé pour la recherche.");
        return;
    }

    chrome.storage.local.get(["my_gemini_log_key"]).then((result) => {

        const GOOGLE_API_KEY = result.my_gemini_log_key;

        const geminiClient = new GeminiLogAnalyseClient(GOOGLE_API_KEY);

        const fReader = new FileReader();
        console.log(document.getElementsByName("logFile"))
        fReader.readAsDataURL(document.getElementsByName("logFile")[0].files[0]);
        fReader.onloadend = function(event){
        
            const dataImg = event.target.result;

            console.log("dataImg", dataImg);
            console.log("dataImg", dataImg.split("base64,")[1]);

            spinner.hidden = false;

            const keyword = getKeyword("keywordSearch",formTagElements["mode"].value);
            
            const langage = formTagElements["language"].value;
            const mode = formTagElements["mode"].value 

            geminiClient.analyseArchiveGemini(formTagElements["iamodel"].value, dataImg.split("base64,")[1], keyword,langage,mode ).then((analyse) => {
                console.log("Analyse", analyse);
                document.getElementById("analyse").innerHTML = analyse;

            }).catch((error) => {
                console.error('Error:', error.message);
                alert("Erreur lors de l'analyse du log");
            }).finally(() => {
                spinner.hidden = true;
            })
        }
    });
});

