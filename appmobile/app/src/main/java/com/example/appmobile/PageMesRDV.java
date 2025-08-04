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

import java.net.URLEncoder;
import java.io.UnsupportedEncodingException;

public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {

    private TextView lienDeco;
    private TextView lienProfil;
    private TextView lienRdv;
    private ListView listRdv;
    private ApiService apiService;
    private TextView messagePrAcunRdv;
    private String courrielPatient;


    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);


        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);

        listRdv = findViewById(R.id.listRdv);
        lienDeco = findViewById(R.id.lienDeconnexion);
        lienProfil = findViewById(R.id.lienProfil);
        lienRdv = findViewById(R.id.lienRdv);
        messagePrAcunRdv = findViewById(R.id.messageAucunRdv);

        lienRdv.setOnClickListener(this);
        lienProfil.setOnClickListener(this);
        lienDeco.setOnClickListener(this);

        apiService = ApiClient.getApiService();

        try {
            courrielPatient = URLEncoder.encode(getIntent().getStringExtra("courriel"), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        if (courrielPatient == null || courrielPatient.isEmpty()) {
            Toast.makeText(this, "Erreur : courriel manquant", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        chargerRdv();
    }

    public void chargerRdv() {
        Call<RdvResponse> call = apiService.getRDV(courrielPatient);
        call.enqueue(new Callback<RdvResponse>() {
            @Override
            public void onResponse(Call<RdvResponse> call, Response<RdvResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<RdvRequest> rdvList = response.body().getRendezvous();
                    afficherRdv(rdvList);
                } else {
                    Toast.makeText(PageMesRDV.this, "Aucun rendez-vous trouvé", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<RdvResponse> call, Throwable t) {
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
        } else if (v == lienRdv) {
            Intent intent = new Intent(PageMesRDV.this, pagePriseService.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
            finish();
        } else if (v == lienProfil) {
            Intent intent = new Intent(PageMesRDV.this, PageProfil.class) ;
            intent.putExtra("token", token);
            intent.putExtra("courriel", courrielPatient);
            startActivity(intent);
            finish();
        }
    }
}
