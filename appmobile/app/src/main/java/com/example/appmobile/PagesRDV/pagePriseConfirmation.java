package com.example.appmobile.PagesRDV;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.MainActivity;
import com.example.appmobile.PageMesRDV;
import com.example.appmobile.PageProfil;
import com.example.appmobile.R;
import com.example.appmobile.RdvCreationRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class pagePriseConfirmation extends AppCompatActivity implements View.OnClickListener {
    private TextView nomService;
    private TextView heureRdv;
    private TextView daterdv;
    private TextView adresseCourriel;
    private Button btnConfirme;
    private Button btnAnnuler;
    private TextView lienDeco;
    private TextView lienProfil;
    private TextView lienMesRdv;
    private String token;
    private String courriel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prise_confirmation);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);
        courriel = prefs.getString("courriel", null);

        lienDeco = findViewById(R.id.lienDeconnexion);
        lienProfil = findViewById(R.id.lienProfil);
        lienMesRdv = findViewById(R.id.lienMesRdv);
        nomService = findViewById(R.id.nomConfirmation);
        heureRdv = findViewById(R.id.heureConfirmation);
        daterdv = findViewById(R.id.dateConfirmation);
        adresseCourriel = findViewById(R.id.adresseCourrielConfriamtion);
        btnConfirme = findViewById(R.id.btnConfirmation);
        btnAnnuler = findViewById(R.id.btnAnnuler);

        lienMesRdv.setOnClickListener(this);
        lienProfil.setOnClickListener(this);
        lienDeco.setOnClickListener(this);
        btnConfirme.setOnClickListener(this);
        btnAnnuler.setOnClickListener(this);

        Intent intent = getIntent();
        String nom = intent.getStringExtra("nom_service");
        String heure = intent.getStringExtra("heure");
        String jour = intent.getStringExtra("jour");

        nomService.setText("Service : " + nom);
        heureRdv.setText("Heure : " + heure);
        daterdv.setText("Date : " + jour);

        if (courriel != null) {
            adresseCourriel.setText(courriel);
        }
    }

    @Override
    public void onClick(View v) {
        if (v == lienDeco) {
            Intent intent = new Intent(pagePriseConfirmation.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        } else if (v == lienMesRdv) {
            Intent intent = new Intent(pagePriseConfirmation.this, PageMesRDV.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        } else if (v == lienProfil) {
            Intent intent = new Intent(pagePriseConfirmation.this, PageProfil.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        } else if (v == btnConfirme) {
            confirmeRDV();
        } else if (v == btnAnnuler) {
            Intent intent = new Intent(pagePriseConfirmation.this, pagePriseMoment.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        }
    }

    private void confirmeRDV() {
        String nomServiceStr = getIntent().getStringExtra("nom_service");
        String jourStr = getIntent().getStringExtra("jour");
        String heureStr = getIntent().getStringExtra("heure");
        String nomEmployeStr = getIntent().getStringExtra("nom_employe");

        RdvCreationRequest rdv = new RdvCreationRequest(
                nomEmployeStr,
                nomServiceStr,
                courriel,
                jourStr,
                heureStr
        );

        ApiService apiService = ApiClient.getApiService();
        Call<Void> call = apiService.postRdv(rdv);

        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Intent intent = new Intent(pagePriseConfirmation.this, PageMesRDV.class);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", courriel);
                    startActivity(intent);
                    finish();
                } else {
                    Log.e("API", "Erreur réponse: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API", "Erreur réseau: " + t.getMessage());
            }
        });
    }
}
