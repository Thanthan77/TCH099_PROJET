package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity extends AppCompatActivity {

    private EditText connexion_email, connexion_mdp;
    private Button btn_se_connecter;
    private TextView lienInscription;
    private com.example.appmobile.ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        connexion_email = findViewById(R.id.connexion_email);
        connexion_mdp = findViewById(R.id.connexion_mdp);
        btn_se_connecter = findViewById(R.id.btn_se_connecter);
        lienInscription = findViewById(R.id.lien_inscription);

        initRetrofit();

        lienInscription.setOnClickListener(v ->
                startActivity(new Intent(MainActivity.this, PageInscription.class))
        );

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

    private void initRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080/") // Localhost pour l’émulateur
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiService = retrofit.create(com.example.appmobile.ApiService.class);
    }

    private void seConnecter(String courriel, String motDePasse) {
        LoginRequest request = new LoginRequest(courriel, motDePasse);
        apiService.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse data = response.body();
                    Toast.makeText(MainActivity.this, "Bienvenue " + data.getCourriel(), Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(MainActivity.this, PageMesRDV.class);
                    intent.putExtra("token", data.getToken());
                    intent.putExtra("id_patient", data.getIdPatient());
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
}
