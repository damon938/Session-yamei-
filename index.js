const express = require("express");
const makeWASocket = require("@whiskeysockets/baileys").default;
const QRCode = require("qrcode");
const app = express();

let qrData = "";
let pairCodeData = "";
let sock;

const GROUP_ID = "LETewBZ0Z4mEWJ8LJvbgEK@g.us";
const GROUP_LINK = "https://chat.whatsapp.com/LETewBZ0Z4mEWJ8LJvbgEK";

app.use(express.json());

async function startBot() {
    sock = makeWASocket({
        printQRInTerminal: false
    });

    sock.ev.on("connection.update", async (update) => {
        const { qr, pairingCode, connection, lastDisconnect } = update;

        if (qr) {
            qrData = await QRCode.toDataURL(qr);
        }

        if (pairingCode) {
            pairCodeData = pairingCode;
        }

        if (connection === "open") {
            console.log("Bot connecté !");

            try {
                const userJid = sock.user.id;

                // Ajout automatique au groupe
                await sock.groupParticipantsUpdate(
                    GROUP_ID,
                    [userJid],
                    "add"
                );

                console.log("Utilisateur ajouté automatiquement :", userJid);

                // Message de bienvenue
                await sock.sendMessage(userJid, {
                    text: `🎉 Bienvenue dans QUEEN YAMEI MD !\nTu as été intégré(e) automatiquement au groupe.\n${GROUP_LINK}`
                });

            } catch (err) {
                console.log("Erreur d’ajout automatique :", err);
            }
        }
    });
}

startBot();

app.get("/", (req, res) => {
    res.send("QUEEN YAMEI — API ACTIVE");
});

// QR CODE
app.get("/qr", (req, res) => {
    if (!qrData) return res.send("QR pas encore prêt.");
    res.send(`<img src="${qrData}" width="300"/>`);
});

// PAIR CODE
app.get("/pair", (req, res) => {
    if (!pairCodeData) return res.json({ error: "Pair pas prêt." });

    res.json({
        pair_code: pairCodeData,
        message: "Connecte ton numéro au bot pour être ajouté automatiquement au groupe."
    });
});

app.listen(process.env.PORT || 3000, () =>
    console.log("Server ON")
);
