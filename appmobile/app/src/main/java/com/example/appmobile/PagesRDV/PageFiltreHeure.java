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
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PageFiltreHeure extends AppCompatActivity implements View.OnClickListener {

    private ListView listView;

    private int codeEmploye;
    private ApiService apiService;
    private String  jourRdv;
    private TextView messagePrAcuneHeure;
    private TextView retour;
    private String token;
    private String courriel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_page_filtre_heure);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);
        courriel = prefs.getString("courriel", null);

        listView = findViewById(R.id.listeHeure);
        retour = findViewById(R.id.retourPageDate);
        messagePrAcuneHeure = findViewById(R.id.messageAucuneDispo);

        jourRdv = getIntent().getStringExtra("date") ;
        if (Objects.equals(jourRdv, "")) {
            Toast.makeText(this, "jour du service manquant", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        codeEmploye = getIntent().getIntExtra("code_employe", -1);
        if (codeEmploye == -1) {
            Toast.makeText(this, "code_employe du service manquant", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        Log.d("DEBUG", "code_employe reçu : " + codeEmploye);


        Log.d("DEBUG", "jourRdv reçu : " + jourRdv );

        apiService = ApiClient.getApiService();
        chargerHoraires();

    }

    private void chargerHoraires() {
        Call<List<FiltreHeureRequest>> call = apiService.getHeure(codeEmploye, jourRdv);
        call.enqueue(new Callback<List<FiltreHeureRequest>>() {
            @Override
            public void onResponse(Call<List<FiltreHeureRequest>> call, Response<List<FiltreHeureRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<FiltreHeureRequest> filtreHeures = response.body();

                    if (filtreHeures.isEmpty()) {
                        messagePrAcuneHeure.setVisibility(View.VISIBLE);
                        listView.setVisibility(View.GONE);
                        return;
                    }

                    messagePrAcuneHeure.setVisibility(View.GONE);
                    listView.setVisibility(View.VISIBLE);

                    Set<String> heuresUniques = new HashSet<>();
                    List<FiltreHeure> rdvItems = new ArrayList<>();

                    for (FiltreHeureRequest h : filtreHeures) {
                        String heure = h.getHeureRdv();
                        if (heuresUniques.add(heure)) {
                            rdvItems.add(new FiltreHeure(
                                    heure,
                                    h.getPrenomEmploye(),
                                    h.getNomEmploye(),
                                    h.getNomService(),
                                    h.getJourRdv()
                            ));
                        }
                    }

                    FiltreHeureAdapter adapter = new FiltreHeureAdapter(
                            PageFiltreHeure.this,
                            rdvItems,
                            filtreHeure -> {
                                Intent intent = new Intent(PageFiltreHeure.this, pagePriseConfirmation.class);
                                intent.putExtra("date", filtreHeure.getJourRdv());
                                intent.putExtra("heure", filtreHeure.getHeureRdv());
                                intent.putExtra("prenom_employe", filtreHeure.getPrenomEmploye());
                                intent.putExtra("nom_employe", filtreHeure.getNomEmploye());
                                intent.putExtra("nom_service", filtreHeure.getNomService());
                                intent.putExtra("token", token);
                                intent.putExtra("courriel", courriel);
                                startActivity(intent);
                            }
                    );
                    listView.setAdapter(adapter);

                } else {
                    Toast.makeText(PageFiltreHeure.this, "Erreur de chargement des heures", Toast.LENGTH_SHORT).show();
                    Log.e("API", "Erreur HTTP: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<FiltreHeureRequest>> call, Throwable t) {
                Toast.makeText(PageFiltreHeure.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                Log.e("API", "Erreur réseau", t);
            }
        });
    }



    @Override
    public void onClick(View view) {
        if (view == retour) {
            Intent intent = new Intent(PageFiltreHeure.this, PageFiltreDate.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        }
    }
}
