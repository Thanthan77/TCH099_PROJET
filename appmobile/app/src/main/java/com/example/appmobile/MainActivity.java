package com.example.appmobile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Écran d'accueil de connexion du patient.
 * Le patient pourra naviguer vers une page d'inscription ou vers la page de ses
 * rendez-vous affichés en se connectant.
 */
public class MainActivity extends AppCompatActivity {

    //Références UI
    private EditText connexion_email, connexion_mdp;
    private Button btn_se_connecter;
    private TextView lienInscription;

    private ApiService apiService; //Client d’API (Retrofit)

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); //Lie le layout activity_main.xml à MainActivity.java

        //Récupération des Views
        connexion_email = findViewById(R.id.connexion_email);
        connexion_mdp = findViewById(R.id.connexion_mdp);
        btn_se_connecter = findViewById(R.id.btn_se_connecter);
        lienInscription = findViewById(R.id.lien_inscription);

        apiService = ApiClient.getApiService(); //Initialisation du service d'API

        //Lien pour créer un compte vers la page d'inscription
        lienInscription.setOnClickListener(v ->
                startActivity(new Intent(MainActivity.this, PageInscription.class))
        );

        //Bouton "Se connecter"
        btn_se_connecter.setOnClickListener(v -> {
            String courriel = connexion_email.getText().toString().trim();
            String mdp = connexion_mdp.getText().toString().trim();

            //Vérifier la présence du courriel et du mot de passe
            if (courriel.isEmpty() || mdp.isEmpty()) {
                Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            } else {
                seConnecter(courriel, mdp); //Envoi de la requête de connexion
            }
        });
    }

    //Appel de l'API de connexion.
    private void seConnecter(String courriel, String motDePasse) {
        LoginRequest request = new LoginRequest(courriel, motDePasse);
        apiService.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                //Affiche un message de bienvenue si la connexion fonctionne et dirige le patient vers la page de ses rendez-vous
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse data = response.body();
                    Toast.makeText(MainActivity.this, "Bienvenue " + data.getCourriel(), Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(MainActivity.this, PageMesRDV.class);
                    intent.putExtra("token", data.getToken());
                    intent.putExtra("courriel", data.getCourriel());
                    startActivity(intent);

                    //Garde la session du patient active
                    SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.putString("courriel", data.getCourriel());
                    editor.putString("token", data.getToken());
                    editor.apply();

                    //Empêche le retour vers l'écran de connexion
                    finish();
                } else {
                    //Message d'erreur si le patient n'entre pas ses bonnes informations
                    Toast.makeText(MainActivity.this, "Identifiants invalides", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                //Message d'erreur de réseau/HTTP
                Toast.makeText(MainActivity.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
