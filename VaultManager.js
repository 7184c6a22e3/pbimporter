// Vault Importer
function DecodeBase64(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function FormatPasteData(data) {
    return [data.ct, [data.adata]]
}

async function ImportPasteData(pasteid) {
    var fetchData;   
    var url = pasteid.split("#");
    var fetchUrl = "https://privatebin.net/?pasteid=" + url[0];
    var key = CryptTool.base58decode(url[1]).padStart(32, '\u0000');
    
    await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'JSONHttpRequest',
            'Content-Type': 'application/json',
        },
    })
    .then(res => res.json())
    .then(data => { fetchData = data });
    
    var decrypted = await CryptTool.decipher(key, document.getElementById("textBoxPass").value, FormatPasteData(fetchData));
    
    var json = JSON.parse(decrypted);
    
    if(json.paste == "")
        return DecodeBase64(json.attachment.substring(json.attachment.indexOf(",") + 1));
    
    return json.paste;
}

// Vault Manager
function isVaultEmpty() {
    if(localStorage.getItem("vault") == null)
        return true;
    
    return false;
}

function VaultReset(arg) {
    localStorage.clear();
    
    if(arg != null)
        document.documentElement.innerHTML = arg;
    else
        document.documentElement.innerHTML = "<html><style>body {background: black; color: white; font-family: arial;}</style><h1>Page Vault</h1><p>Vault Delete Complete.</p></html>";
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
    document.getElementsByClassName("loadingIcon")[0].style.opacity = 1;
    document.getElementsByClassName("user-box")[0].style.visibility = 'hidden';
    document.getElementsByClassName("user-box")[1].style.visibility = 'hidden';
    document.getElementsByTagName("a")[0].style.visibility = 'hidden';
    
    var res = "";
    var arrId = document.getElementById("textBoxID").value.split('#')
    
    for(var i = 0; i < arrId.length; i += 2) 
    {
        await ImportPasteData(arrId[i] + '#' + arrId[i + 1]).then(paste => { res += paste });
    }
    
    //await ImportPasteData(document.getElementById("textBoxID").value).then(paste => { res = paste });
    VaultInsert(res);
}
