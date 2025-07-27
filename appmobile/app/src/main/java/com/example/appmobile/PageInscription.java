package com.example.appmobile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.annotations.SerializedName;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Headers;
import retrofit2.http.POST;

public class PageInscription extends AppCompatActivity implements View.OnClickListener {

    private TextView messageInfo;
    private EditText nom, prenom, courriel, telephone, assurancemaladie, naissance;
    private EditText motPasse, confirmationPasse, adresse;
    private Button soumis;

    private static final String BASE_URL = "http://localhost/api"; // 🔁 Remplace ça

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inscription);

        messageInfo = findViewById(R.id.inscription);
        nom = findViewById(R.id.inscription_nom);
        prenom = findViewById(R.id.inscription_prenom);
        courriel = findViewById(R.id.inscription_email);
        telephone = findViewById(R.id.inscription_tel);
        assurancemaladie = findViewById(R.id.inscription_nam);
        naissance = findViewById(R.id.inscription_naissance);
        motPasse = findViewById(R.id.inscription_mdp);
        confirmationPasse = findViewById(R.id.inscription_mdp_confirmation);
        adresse = findViewById(R.id.inscription_adresse_autocomplete);
        soumis = findViewById(R.id.btn_creer_compte);
        soumis.setOnClickListener(this);
    }

    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.btn_creer_compte) {
            if (!motPasse.getText().toString().equals(confirmationPasse.getText().toString())) {
                Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }

            RegisterRequest request = new RegisterRequest(
                    courriel.getText().toString(),
                    motPasse.getText().toString(),
                    prenom.getText().toString(),
                    nom.getText().toString(),
                    telephone.getText().toString(),
                    "123",                              // NUM_CIVIQUE fictif — tu peux l'ajouter dans l’UI
                    adresse.getText().toString(),       // RUE complète ici
                    "Terrebonne",                       // VILLE par défaut — à rendre dynamique
                    "J6X3X4",                           // CODE_POSTAL fictif — pareil
                    assurancemaladie.getText().toString(),
                    naissance.getText().toString()
            );

            creerCompte(request);
        }
    }

    private void creerCompte(RegisterRequest request) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL) // ex. "https://ton-serveur.com/api/"
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        APIService apiService = retrofit.create(APIService.class);

        Call<RegisterResponse> call = apiService.creerPatient(request);
        call.enqueue(new Callback<RegisterResponse>() {
            @Override
            public void onResponse(Call<RegisterResponse> call, Response<RegisterResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(PageInscription.this, "✔ " + response.body().message, Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(PageInscription.this, "⛔ Erreur: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<RegisterResponse> call, Throwable t) {
                Toast.makeText(PageInscription.this, "⚠ Connexion impossible: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // 🧾 Requête envoyée au serveur
    public static class RegisterRequest {
        @SerializedName("COURRIEL") public String courriel;
        @SerializedName("MOT_DE_PASSE") public String motDePasse;
        @SerializedName("PRENOM_PATIENT") public String prenom;
        @SerializedName("NOM_PATIENT") public String nom;
        @SerializedName("NUM_TEL") public String tel;
        @SerializedName("NUM_CIVIQUE") public String civique;
        @SerializedName("RUE") public String rue;
        @SerializedName("VILLE") public String ville;
        @SerializedName("CODE_POSTAL") public String codePostal;
        @SerializedName("NO_ASSURANCE_MALADIE") public String assurance;
        @SerializedName("DATE_NAISSANCE") public String naissance;

        public RegisterRequest(String courriel, String motDePasse, String prenom, String nom,
                               String tel, String civique, String rue, String ville,
                               String codePostal, String assurance, String naissance) {
            this.courriel = courriel;
            this.motDePasse = motDePasse;
            this.prenom = prenom;
            this.nom = nom;
            this.tel = tel;
            this.civique = civique;
            this.rue = rue;
            this.ville = ville;
            this.codePostal = codePostal;
            this.assurance = assurance;
            this.naissance = naissance;
        }
    }

    // 📥 Réponse du serveur
    public static class RegisterResponse {
        public String message;
        public String error;
    }

    // 🔗 Interface API
    public interface APIService {
        @Headers("Content-Type: application/json")
        @POST("inscription_patient.php") // Ton fichier côté serveur
        Call<RegisterResponse> creerPatient(@Body RegisterRequest request);
    }
}
