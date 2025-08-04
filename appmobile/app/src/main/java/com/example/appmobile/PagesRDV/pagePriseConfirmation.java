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
import com.example.appmobile.RdvRequest;

import java.util.List;

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

        RdvRequest rdv = (RdvRequest) getIntent().getSerializableExtra("rdv_request");
        if (rdv != null) {
            String courrielRdv = rdv.getCourriel();
            adresseCourriel.setText(courrielRdv);
        } else if (courriel != null) {
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
            Intent intent = new Intent(pagePriseConfirmation.this, pagePriseService.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        } else if (v == btnAnnuler) {
            Intent intent = new Intent(pagePriseConfirmation.this, pagePriseMoment.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        }
    }

    private void confirmeRDV() {
        ApiService apiService = ApiClient.getApiService();
        Call<List<RdvRequest>> call = apiService.postModifRdv();

        call.enqueue(new Callback<List<RdvRequest>>() {
            @Override
            public void onResponse(Call<List<RdvRequest>> call, Response<List<RdvRequest>> response) {
                if (response.isSuccessful()) {
                    List<RdvRequest> rdvList = response.body();
                    Log.d("API", "Succès : " + rdvList.size() + " rendez-vous reçus.");
                    Intent intent = new Intent(getApplicationContext(), PageMesRDV.class);
                    startActivity(intent);
                    finish();
                } else {
                    Log.e("API", "Erreur dans la réponse : " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<RdvRequest>> call, Throwable t) {
                Log.e("API", "Erreur : " + t.getMessage());
            }
        });
    }
}
