package com.example.appmobile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.PagesRDV.pagePriseService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {

    private TextView lienDeco;
    private TextView lienProfil;
    private TextView lienMesRdv;
    private ListView listRdv;
    private ApiService apiService;
    private TextView messagePrAcunRdv;
    private String courrielPatient;

    // Ajout discret pour récupérer le token sans interférer
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);

        // Lecture des SharedPreferences pour récupérer le token
        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null); // Peut être utilisé plus tard si besoin

        listRdv = findViewById(R.id.listRdv);
        lienDeco = findViewById(R.id.lienDeconnexion);
        lienProfil = findViewById(R.id.lienProfil);
        lienMesRdv = findViewById(R.id.lienMesRdv);
        messagePrAcunRdv = findViewById(R.id.messageAucunRdv);

        lienMesRdv.setOnClickListener(this);
        lienProfil.setOnClickListener(this);
        lienDeco.setOnClickListener(this);

        apiService = ApiClient.getApiService();

        courrielPatient = getIntent().getStringExtra("courriel");

        if (courrielPatient == null || courrielPatient.isEmpty()) {
            Toast.makeText(this, "Erreur : courriel manquant", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        chargerRdv();
    }

    public void chargerRdv() {
        Call<List<RdvRequest>> call = apiService.getRDV(courrielPatient);
        call.enqueue(new Callback<List<RdvRequest>>() {
            @Override
            public void onResponse(Call<List<RdvRequest>> call, Response<List<RdvRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<RdvRequest> rdvList = response.body();
                    afficherRdv(rdvList);
                } else {
                    Toast.makeText(PageMesRDV.this, "Aucun rendez-vous trouvé", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<RdvRequest>> call, Throwable t) {
                Log.e("API", "Erreur : " + t.getMessage());
                Toast.makeText(PageMesRDV.this, "Erreur de connexion", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void afficherRdv(List<RdvRequest> rdvRequests) {
        if (rdvRequests == null || rdvRequests.isEmpty()) {
            messagePrAcunRdv.setVisibility(View.VISIBLE);
            listRdv.setVisibility(View.GONE);
        } else {
            messagePrAcunRdv.setVisibility(View.GONE);
            listRdv.setVisibility(View.VISIBLE);

            List<RdvInfo> rdvInfos = new ArrayList<>();
            for (RdvRequest request : rdvRequests) {
                RdvInfo rdv = new RdvInfo(0, request.getJourRdv(), request.getHeureRdv(), request.getIdRdv());
                rdv.setCourriel(request.getCourriel());
                rdvInfos.add(rdv);
            }

            RDVadaptater adapter = new RDVadaptater(rdv -> {}, rdvInfos, this) {
                public void onClick(RdvInfo rdv) { }
            };

            listRdv.setAdapter(adapter);
        }
    }

    @Override
    public void onClick(View v) {
        if (v == lienDeco) {
            Intent intent = new Intent(PageMesRDV.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        } else if (v == lienMesRdv) {
            startActivity(new Intent(this, pagePriseService.class));
            finish();
        } else if (v == lienProfil) {
            startActivity(new Intent(this, PageProfil.class));
            finish();
        }
    }
}
