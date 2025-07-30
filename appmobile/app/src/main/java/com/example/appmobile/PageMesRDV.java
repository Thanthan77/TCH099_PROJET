package com.example.appmobile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.List;

import PagesRDV.*;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.example.appmobile.*;



public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {


    private Button btneffacer;
    private TextView textrdv;
    private ListView listView;
    private RDVadaptater adaptater;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        String token = prefs.getString("token", null);
        String courriel = prefs.getString("courriel", null);

        listView = findViewById(R.id.listRdv);
     //   adaptater = new RDVadaptater(PageMesRDV.this, listView);
        listView.setAdapter(adaptater);

        btneffacer = (Button) findViewById(R.id.btnannulerrdv);
        btneffacer.setOnClickListener(this);

    }


    @Override
    public void onClick(View view) {

        if (view.getId() == R.id.btnannulerrdv) {


        }


    }

    private void chargerHoraires() {
        Call<List<HoraireRequest>> call = apiService.getHoraire();

        call.enqueue(new Callback<List<HoraireRequest>>() {
            @Override
            public void onResponse(Call<List<HoraireRequest>> call, Response<List<HoraireRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<HoraireRequest> horaires = response.body();

                    List<HoraireRdv> rdvItems = new ArrayList<>();
                    for (HoraireRequest h : horaires) {
                        rdvItems.add(new HoraireRdv(nomService, h.getJourRdv(), h.getHeureRdv()));
                    }
                    HoraireAdapter adapter = new HoraireAdapter(
                            pagePriseMoment.this,
                            rdvItems,
                            horaire -> {
                                // Lors du clic sur "Prendre RDV"
                                Intent intent = new Intent(pagePriseMoment.this, pagePriseConfirmation.class);
                                intent.putExtra("nom_service", horaire.getNomService());
                                intent.putExtra("jour", horaire.getJourRdv());
                                intent.putExtra("heure", horaire.getHeureRdv());
                                startActivity(intent);
                            }
                    );

                    listView.setAdapter(adapter);

                } else {
                    Toast.makeText(pagePriseMoment.this, "Erreur de chargement des horaires", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<List<HoraireRequest>> call, Throwable t) {
                Toast.makeText(pagePriseMoment.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
