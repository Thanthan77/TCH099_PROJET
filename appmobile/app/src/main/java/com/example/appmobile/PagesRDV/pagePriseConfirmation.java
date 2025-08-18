package com.example.appmobile.PagesRDV;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

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

    private TextView nomService, heure, date, nomEmploye, prenomEmploye;
    private Button btnConfirme, btnAnnuler;
    private TextView lienDeco, lienProfil, lienMesRdv;

    private String token, courriel;
    private String nomServiceStr, heureStr, jourStr, nomEmployeStr, prenomEmployeStr;

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
        heure = findViewById(R.id.heureConfirmation);
        date= findViewById(R.id.dateConfirmation);
        nomEmploye = findViewById(R.id.nomEmployeConfirmation);
        prenomEmploye = findViewById(R.id.prenomEmployeConfirmation);
        btnConfirme = findViewById(R.id.btnConfirmation);
        btnAnnuler = findViewById(R.id.btnAnnuler);


        lienMesRdv.setOnClickListener(this);
        lienProfil.setOnClickListener(this);
        lienDeco.setOnClickListener(this);
        btnConfirme.setOnClickListener(this);
        btnAnnuler.setOnClickListener(this);


        Intent intent = getIntent();
        nomServiceStr = intent.getStringExtra("nom_service");
        Log.e("API", "Erreur réponse: " + nomServiceStr);
        heureStr = intent.getStringExtra("heure");
        Log.e("API", "Erreur réponse: " + heureStr);
        jourStr = intent.getStringExtra("jour");
        Log.e("API", "Erreur réponse: " + jourStr);
        nomEmployeStr = intent.getStringExtra("nom_employe");
        Log.e("API", "Erreur réponse: " + nomServiceStr);
        prenomEmployeStr = intent.getStringExtra("prenom_employe");
        Log.e("API", "Erreur réponse: " + prenomEmployeStr);





        nomService.setText("Service : " + nomServiceStr);
        heure.setText("Heure : " + heureStr);
        date.setText("Date : " + jourStr);
        nomEmploye.setText("Nom : " + nomEmployeStr);
        prenomEmploye.setText("Prénom : " + prenomEmployeStr);
    }

    @Override
    public void onClick(View v) {
        if (v == lienDeco) {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        } else if (v == lienMesRdv) {
            Intent intent = new Intent(this, PageMesRDV.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        } else if (v == lienProfil) {
            Intent intent = new Intent(this, PageProfil.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        } else if (v == btnConfirme) {
            confirmeRDV();
        } else if (v == btnAnnuler) {
            Intent intent = new Intent(this, PageFiltreHeure.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        }
    }

    private void confirmeRDV() {
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
                    Toast.makeText(pagePriseConfirmation.this,
                            "RDV confirmé avec " + prenomEmployeStr + " " + nomEmployeStr,
                            Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(pagePriseConfirmation.this, PageMesRDV.class);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", courriel);
                    startActivity(intent);
                    finish();
                } else {
                    Log.e("API", "Erreur réponse: " + response.code());
                    Toast.makeText(pagePriseConfirmation.this, "Erreur lors de la confirmation du RDV", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API", "Erreur réseau: " + t.getMessage());
                Toast.makeText(pagePriseConfirmation.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
