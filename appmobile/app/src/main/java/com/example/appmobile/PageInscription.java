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

public class PageInscription extends AppCompatActivity {

    private EditText prenom, nom, nam, naissance, civique, rue, ville, postal, tel, email, emailConf, mdp, mdpConf;

    private Button btnCreerCompte;
    private TextView lienConnexion;

    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inscription);

        // Initialiser les champs
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

        lienConnexion.setOnClickListener(v ->
                startActivity(new Intent(PageInscription.this, MainActivity.class))
        );

        btnCreerCompte.setOnClickListener(v -> {
            if (validerChamps()) {
                envoyerInscription();
            }
        });
    }

    private boolean validerChamps() {
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

        if (!email.getText().toString().equals(emailConf.getText().toString())) {
            Toast.makeText(this, "Les courriels ne correspondent pas", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!mdp.getText().toString().equals(mdpConf.getText().toString())) {
            Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }

    private void envoyerInscription() {
        JSONObject json = new JSONObject();
        try {
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
            e.printStackTrace();
            Toast.makeText(this, "Erreur de format JSON", Toast.LENGTH_SHORT).show();
            return;
        }

        RequestBody body = RequestBody.create(
                MediaType.parse("application/json"),
                json.toString()
        );

        Call<ResponseBody> call = apiService.inscrirePatient(body);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(PageInscription.this, "Compte créé avec succès", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(PageInscription.this, MainActivity.class));
                    finish();
                } else if (response.code() == 409) {
                    Toast.makeText(PageInscription.this, "Ce courriel est déjà utilisé", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(PageInscription.this, "Erreur lors de l'inscription", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(PageInscription.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
