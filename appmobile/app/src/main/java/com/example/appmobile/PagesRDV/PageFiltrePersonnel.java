package com.example.appmobile.PagesRDV;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.R;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PageFiltrePersonnel extends AppCompatActivity implements View.OnClickListener{
    private ListView listView;
    private ApiService apiService;
    private int idService;
    private TextView messagePrAucunPersonnel;
    private TextView retour;
    private String token;
    private String courriel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_page_filtre_personnel);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);
        courriel = prefs.getString("courriel", null);

        listView = findViewById(R.id.listePersonnel) ;
        retour = findViewById(R.id.retourPageService);
        messagePrAucunPersonnel = findViewById(R.id.messageAucuneDispo);

        retour.setOnClickListener(this) ;

        idService = getIntent().getIntExtra("id_service", -1);
        if (idService == -1) {
            Toast.makeText(this, "ID du service manquant", Toast.LENGTH_SHORT).show();
            finish();
            return;VACVA
        }

        Log.d("DEBUG", "id_service reçu : " + idService);
        apiService = ApiClient.getApiService();
        chargerHoraires();
    }

    private void chargerHoraires() {
        Call<List<FiltrePersonnelRequest>> call = apiService.getCodeEmploye(idService);
        call.enqueue(new Callback<List<FiltrePersonnelRequest>>() {
            @Override
            public void onResponse(Call<List<FiltrePersonnelRequest>> call, Response<List<FiltrePersonnelRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("API", "Réponse code: " + response.code());
                    Log.d("API", "Réponse body: " + response.body());
                    List<FiltrePersonnelRequest> filtrePersonnels = response.body();

                    if (filtrePersonnels.isEmpty()) {
                        messagePrAucunPersonnel.setVisibility(View.VISIBLE);
                        listView.setVisibility(View.GONE);
                        return;
                    }
                    messagePrAucunPersonnel.setVisibility(View.GONE);
                    listView.setVisibility(View.VISIBLE);

                    List<FiltrePersonnel> rdvItems = new ArrayList<>();
                    for (FiltrePersonnelRequest p : filtrePersonnels) {
                        rdvItems.add(new FiltrePersonnel(
                                p.getCodeEmploye(),
                                p.getNomEmploye()
                        ));
                    }
                    FiltrePersonneAdapter adapter = new FiltrePersonneAdapter(
                            PageFiltrePersonnel.this,
                            rdvItems,
                            filtre -> {
                                Intent intent = new Intent(PageFiltrePersonnel.this, PageFiltreDate.class);
                                intent.putExtra("code_employe", filtre.getCodeEmploye());
                                intent.putExtra("token", token);
                                intent.putExtra("courriel", courriel);
                                startActivity(intent);
                            }
                    );
                    listView.setAdapter(adapter);

                } else {
                    Toast.makeText(PageFiltrePersonnel.this, "Erreur de chargement des employes", Toast.LENGTH_SHORT).show();
                    Log.e("API", "Erreur HTTP: " + response.code());
                    Log.e("API", "Échec réseau");
                }
            }

            @Override
            public void onFailure(Call<List<FiltrePersonnelRequest>> call, Throwable t) {
                Toast.makeText(PageFiltrePersonnel.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                Log.e("API", "Erreur réseau", t);
            }
        });
    }

    @Override
        public void onClick(View view) {
            if (view == retour) {
                Intent intent = new Intent(PageFiltrePersonnel.this, pagePriseService.class);
                intent.putExtra("token", token);
                intent.putExtra("courriel", courriel);
                startActivity(intent);
                finish();
            }

        }
}


