// Vault Importer
function FormatPasteData(data) {
    return [data.ct, [data.adata]]
}

function ImportPasteData() {
    var fetchData;   
    var url = document.getElementById("textBoxID").value.split("#");
    var fetchUrl = "https://privatebin.net/?pasteid=" + url[0];
    var key = CryptTool.base58decode(url[1]).padStart(32, '\u0000');
    
    fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'JSONHttpRequest',
            'Content-Type': 'application/json',
        },
    })
    .then(res => res.json())
    .then(data => { fetchData = data });
    
    paste = await CryptTool.decipher(key, document.getElementById("textBoxPass").value, FormatPasteData(fetchData));
    
    return JSON.parse(paste).paste;
}

// Vault Manager
function isVaultEmpty() {
    if(localStorage.getItem("vault") == null)
        return true;
    
    return false;
}

function VaultReset() {
    localStorage.clear();
    document.write("<html><style>body {background: black; color: white; font-family: arial;}</style><h1>Page Vault</h1><p>Vault Delete Complete.</p></html>");
}

function VaultLoad() {


    console.log("Loading Vault...");

    if((Date.now() / 1000) - localStorage.getItem("vault_resetTimer") > 10 || localStorage.getItem("vault_resetTimer") == null) {
        localStorage.setItem("vault_resetTimer", Date.now() / 1000);
        localStorage.setItem("vault_refreshCounter", 0)
    }
    if((Date.now() / 1000) - localStorage.getItem("vault_resetTimer") < 10) {
        localStorage.setItem("vault_refreshCounter", parseInt(localStorage.getItem("vault_refreshCounter")) + 1);
    }
    if(localStorage.getItem("vault_refreshCounter") > 9) {
        if(confirm("Confirm Vault LocalStorage Deletion."))
            VaultReset();
    }    

    document.write(localStorage.getItem("vault"));
}

function VaultInit() {
    if(!isVaultEmpty()) {
        VaultLoad();
    }
}

function VaultInsert(data) {
    console.log("Saving data to Vault");
    localStorage.setItem("vault", data);
    document.write(localStorage.getItem("vault"));
}

async function HttpImport(uri) {
    if(uri == "")
        return;

    console.log("Fetching " + uri);

    // Fetch med CORS-Proxy

    var obj;

    try {
        await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(uri)}`)
        .then(res => res.json())
        .then(data => {
            obj = data;
        });
    }
    catch(e) {
        alert("URL Fetching Error: " + e.message);
        return;
    }
    return obj.contents;
}

async function onBtnImportClick() {
    VaultInsert(await HttpImport(document.getElementById("textBoxURL").value));
}
