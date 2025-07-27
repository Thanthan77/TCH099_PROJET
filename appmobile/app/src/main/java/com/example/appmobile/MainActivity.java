package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import com.google.gson.annotations.SerializedName;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity extends AppCompatActivity {

    private EditText connexion_email, connexion_mdp;
    private Button btn_se_connecter;
    private TextView lienInscription, lienMotDePasse;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 🔗 Références UI
        connexion_email = findViewById(R.id.connexion_email);
        connexion_mdp = findViewById(R.id.connexion_mdp);
        btn_se_connecter = findViewById(R.id.btn_se_connecter);
        lienInscription = findViewById(R.id.lien_inscription);
        lienMotDePasse = findViewById(R.id.lien_modifier_mdp);

        // 🔧 Initialisation Retrofit
        initRetrofit();

        // 🧭 Navigation vers Inscription et Mot de Passe
        lienInscription.setOnClickListener(view ->
                startActivity(new Intent(MainActivity.this, PageInscription.class))
        );

        lienMotDePasse.setOnClickListener(view ->
                startActivity(new Intent(MainActivity.this, modificationMotPasse.class))
        );

        // ✅ Action bouton "Se connecter"
        btn_se_connecter.setOnClickListener(v -> {
            String courriel = connexion_email.getText().toString().trim();
            String mdp = connexion_mdp.getText().toString().trim();

            if (courriel.isEmpty() || mdp.isEmpty()) {
                Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            } else {
                seConnecter(courriel, mdp);
            }
        });
    }

    // 🔧 Création instance Retrofit
    private void initRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080/") // ← backend local ou distant
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(ApiService.class);
    }

    // 🚀 Envoi de la requête de connexion
    private void seConnecter(String courriel, String motDePasse) {
        LoginRequest request = new LoginRequest(courriel, motDePasse);
        Call<LoginResponse> call = apiService.login(request);

        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body().getToken();
                    String emailRecu = response.body().getCourriel();

                    Toast.makeText(MainActivity.this, "Connexion réussie", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(MainActivity.this, PageMesRDV.class);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", emailRecu);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(MainActivity.this, "Identifiants invalides", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // 📤 Classe de requête pour l’API
    public class LoginRequest {
        private String COURRIEL;
        private String MOT_DE_PASSE;

        public LoginRequest(String courriel, String motDePasse) {
            this.COURRIEL = courriel;
            this.MOT_DE_PASSE = motDePasse;
        }
    }

    // 📥 Classe de réponse attendue
    public class LoginResponse {
        @SerializedName("token")
        private String token;

        @SerializedName("COURRIEL")
        private String courriel;

        public String getToken() { return token; }

        public String getCourriel() { return courriel; }
    }

    // 🌐 Interface Retrofit
    public interface ApiService {
        @retrofit2.http.POST("api/login_patient")
        Call<LoginResponse> login(@retrofit2.http.Body LoginRequest request);
    }
}
