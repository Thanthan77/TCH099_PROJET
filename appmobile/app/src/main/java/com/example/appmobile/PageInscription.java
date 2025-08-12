package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONException;
import org.json.JSONObject;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import android.text.InputFilter;

/**Écran d'inscription du patient.
 * Le patient devra remplir toutes ses informations dans les champs désignés et pourra se créer un compte patient.
 * Le patient sera dirigé vers la page de connexion une fois l'inscription complétée ou s'il clique sur le lien "Vous avez déjà un compte?"
 */
public class PageInscription extends AppCompatActivity {
    //Imposer les formats des informations du patients
    private static final String RX_NOM        = "^[\\p{L} '-]+$"; //Pour les noms et ville, seulement des lettres, espaces, apostrophes et traits d'union
    private static final String RX_CIVIQUE    = "^\\d+$"; //Pour le numéro civique, seulement des chiffres
    private static final String RX_DATE       = "^\\d{4}-\\d{2}-\\d{2}$"; //Pour date de naissance, seulement des chiffres sous le format : AAAA-MM-JJ
    private static final String RX_POSTAL     = "^[A-Z]\\d[A-Z]\\d[A-Z]\\d$"; //Pour code postal, seulement chiffres et lettres sous ce format : A1A1A1
    private static final String RX_RAMQ       = "^[A-Z]{4}\\d{8}$"; //Pour numéro d'assurance maladie, seulement chiffres et lettres sous ce format : AAAA11112222
    private static final String RX_TEL10      = "^\\d{10}$"; //Pour numéro de téléphone, seulement 10 chiffres

    //Références UI
    private EditText prenom, nom, nam, naissance, civique, rue, ville, postal, tel, email, emailConf, mdp, mdpConf;

    private Button btnCreerCompte;
    private TextView lienConnexion;

    //Client API
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inscription);

        //Récupération des Views
        prenom = findViewById(R.id.inscription_prenom);
        nom = findViewById(R.id.inscription_nom);
        nam = findViewById(R.id.inscription_nam);
        naissance = findViewById(R.id.inscription_naissance);
        civique = findViewById(R.id.inscription_civique);
        rue = findViewById(R.id.inscription_rue);
        ville = findViewById(R.id.inscription_ville);
        postal = findViewById(R.id.inscription_postal);
        tel = findViewById(R.id.inscription_tel);
        email = findViewById(R.id.inscription_email);
        emailConf = findViewById(R.id.inscription_email_confirmation);
        mdp = findViewById(R.id.inscription_mdp);
        mdpConf = findViewById(R.id.inscription_mdp_confirmation);

        btnCreerCompte = findViewById(R.id.btn_creer_compte);
        lienConnexion = findViewById(R.id.lien_connexion);

        apiService = ApiClient.getApiService();

        //Imposer les chiffres pour téléphone et num civique
        InputFilter digitsOnly = (src, s, e, dest, ds, de) -> src.toString().matches("\\d+") ? src : "";
        tel.setFilters(new InputFilter[]{digitsOnly});
        civique.setFilters(new InputFilter[]{digitsOnly});

        //Imposer lettres en majuscules
        nam.addTextChangedListener(new SimpleTextWatcher() {
            @Override public void onTextChanged(CharSequence cs, int s, int b, int c) {
                String up = cs.toString().toUpperCase();
                if (!up.equals(cs.toString())) { nam.setText(up); nam.setSelection(up.length()); }
            }
        });
        postal.addTextChangedListener(new SimpleTextWatcher() {
            @Override public void onTextChanged(CharSequence cs, int s, int b, int c) {
                String up = cs.toString().replace(" ", "").toUpperCase();
                if (!up.equals(cs.toString())) { postal.setText(up); postal.setSelection(up.length()); }
            }
        });

        //Lien vers connexion
        lienConnexion.setOnClickListener(v ->
                startActivity(new Intent(PageInscription.this, MainActivity.class))
        );

        //Bouton pour créer le compte
        btnCreerCompte.setOnClickListener(v -> {
            if (validerChamps()) {
                envoyerInscription();
            }
        });
    }

    /**
     * Valide les champs, les formats et applique les majuscules ou les chiffres selon l'information entrée.
     */
    private boolean validerChamps() {
        //Présence de tous les champs
        if (TextUtils.isEmpty(prenom.getText()) || TextUtils.isEmpty(nom.getText())
                || TextUtils.isEmpty(nam.getText()) || TextUtils.isEmpty(naissance.getText())
                || TextUtils.isEmpty(civique.getText()) || TextUtils.isEmpty(rue.getText())
                || TextUtils.isEmpty(ville.getText()) || TextUtils.isEmpty(postal.getText())
                || TextUtils.isEmpty(tel.getText()) || TextUtils.isEmpty(email.getText())
                || TextUtils.isEmpty(emailConf.getText()) || TextUtils.isEmpty(mdp.getText())
                || TextUtils.isEmpty(mdpConf.getText())) {
            Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return false;
        }

        //Vérifie si l'email est identique à l'email de confirmation
        if (!email.getText().toString().equals(emailConf.getText().toString())) {
            Toast.makeText(this, "Les courriels ne correspondent pas", Toast.LENGTH_SHORT).show();
            return false;
        }

        //Vérifie si le mdp est identique au mdp de confirmation
        if (!mdp.getText().toString().equals(mdpConf.getText().toString())) {
            Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
            return false;
        }

        //Applique les majuscules, minuscules et enlève les espaces non nécessaires
        String vPrenom = prenom.getText().toString().trim();
        String vNom    = nom.getText().toString().trim();
        String vNam    = nam.getText().toString().trim().toUpperCase();
        String vDate   = naissance.getText().toString().trim();
        String vCiv    = civique.getText().toString().trim();
        String vVille  = ville.getText().toString().trim();
        String vPost   = postal.getText().toString().trim().replace(" ", "").toUpperCase();
        String vTel    = tel.getText().toString().trim();
        String vEmail  = email.getText().toString().trim().toLowerCase();

        //Formats des informations
        if (!vPrenom.matches(RX_NOM)) {
            Toast.makeText(this, "Prénom invalide : lettres, accents ou tirets seulement.", Toast.LENGTH_SHORT).show();
            prenom.requestFocus(); return false;
        }
        if (!vNom.matches(RX_NOM)) {
            Toast.makeText(this, "Nom invalide : lettres, accents ou tirets seulement.", Toast.LENGTH_SHORT).show();
            nom.requestFocus(); return false;
        }
        if (!vNam.matches(RX_RAMQ)) {
            Toast.makeText(this, "Numéro assurance maladie invalide : format AAAA12345678", Toast.LENGTH_SHORT).show();
            nam.requestFocus(); return false;
        }
        if (!vDate.matches(RX_DATE)) {
            Toast.makeText(this, "Date invalide : format AAAA-MM-JJ, 2025-01-01.", Toast.LENGTH_SHORT).show();
            naissance.requestFocus(); return false;
        }
        if (!vCiv.matches(RX_CIVIQUE)) {
            Toast.makeText(this, "Numéro civique invalide : chiffres uniquement.", Toast.LENGTH_SHORT).show();
            civique.requestFocus(); return false;
        }
        if (!vVille.matches(RX_NOM)) {
            Toast.makeText(this, "Ville invalide : lettres, accents ou tirets seulement.", Toast.LENGTH_SHORT).show();
            ville.requestFocus(); return false;
        }
        if (!vPost.matches(RX_POSTAL)) {
            Toast.makeText(this, "Code postal invalide : format A1A1A1.", Toast.LENGTH_SHORT).show();
            postal.requestFocus(); return false;
        }
        if (!vTel.matches(RX_TEL10)) {
            Toast.makeText(this, "Téléphone invalide : 10 chiffres.", Toast.LENGTH_SHORT).show();
            tel.requestFocus(); return false;
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(vEmail).matches()) {
            Toast.makeText(this, "Courriel invalide : ex. exemple@gmail.com.", Toast.LENGTH_SHORT).show();
            email.requestFocus(); return false;
        }
        nam.setText(vNam);
        postal.setText(vPost);
        email.setText(vEmail);
        return true;
    }

    /**
     * Construit le JSON d'inscription et l'envoie à l'API
     */
    private void envoyerInscription() {
        JSONObject json = new JSONObject();
        try {
            //Corps JSON attendu par l'API
            json.put("COURRIEL", email.getText().toString());
            json.put("MOT_DE_PASSE", mdp.getText().toString());
            json.put("PRENOM_PATIENT", prenom.getText().toString());
            json.put("NOM_PATIENT", nom.getText().toString());
            json.put("NO_ASSURANCE_MALADIE", nam.getText().toString());
            json.put("DATE_NAISSANCE", naissance.getText().toString());
            json.put("NUM_CIVIQUE", Integer.parseInt(civique.getText().toString()));
            json.put("RUE", rue.getText().toString());
            json.put("VILLE", ville.getText().toString());
            json.put("CODE_POSTAL", postal.getText().toString());
            json.put("NUM_TEL", Long.parseLong(tel.getText().toString()));
        } catch (JSONException e) {
            //Erreur de construction JSON
            e.printStackTrace();
            Toast.makeText(this, "Erreur de format JSON", Toast.LENGTH_SHORT).show();
            return;
        }

        //Corps de requête
        RequestBody body = RequestBody.create(
                MediaType.parse("application/json"),
                json.toString()
        );

        //Appel vers endpoint d'inscription
        Call<ResponseBody> call = apiService.inscrirePatient(body);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    //Message de succès pour la création du compte
                    Toast.makeText(PageInscription.this, "Compte créé avec succès", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(PageInscription.this, MainActivity.class));
                    finish();
                } else if (response.code() == 409) {
                    //Message d'erreur pour l'inscription avec un email déjà utilisé
                    Toast.makeText(PageInscription.this, "Ce courriel est déjà utilisé", Toast.LENGTH_SHORT).show();
                } else {
                    //Message d'erreur HTTP
                    Toast.makeText(PageInscription.this, "Erreur lors de l'inscription", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                //Erreur réseau/transport
                Toast.makeText(PageInscription.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    //TextWatcher
    private abstract static class SimpleTextWatcher implements android.text.TextWatcher {
        @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
        @Override public void afterTextChanged(android.text.Editable s) {}
    }
}
