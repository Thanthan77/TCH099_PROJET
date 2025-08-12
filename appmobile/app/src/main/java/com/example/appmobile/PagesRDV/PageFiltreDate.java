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

public class PageFiltreDate extends AppCompatActivity implements View.OnClickListener{

    private ListView listView;
    private ApiService apiService;

    private int codeEmploye ;
    private TextView messagePrAcuneDate;
    private TextView retour;
    private String token;
    private String courriel;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_page_filtre_date);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);
        courriel = prefs.getString("courriel", null);

        listView = findViewById(R.id.listeDate);
        retour = findViewById(R.id.retourPagePersonnel);
        messagePrAcuneDate = findViewById(R.id.messageAucuneDispo);

        codeEmploye = getIntent().getIntExtra("code_employe", -1);
        if (codeEmploye == -1) {
            Toast.makeText(this, "code_employe du service manquant", Toast.LENGTH_SHORT).show();
            finish();
          return;
        }

        Log.d("DEBUG", "code_employe reçu : " + codeEmploye);

        apiService = ApiClient.getApiService();
        chargerHoraires();

    }
    private void chargerHoraires() {
        Call<List<FiltreDateRequest>> call = apiService.getDate(codeEmploye);
        call.enqueue(new Callback<List<FiltreDateRequest>>() {
            @Override
            public void onResponse(Call<List<FiltreDateRequest>> call, Response<List<FiltreDateRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<FiltreDateRequest> filtreDates = response.body();

                    if (filtreDates.isEmpty()) {
                        messagePrAcuneDate.setVisibility(View.VISIBLE);
                        listView.setVisibility(View.GONE);
                        return;
                    }

                    Set<String> datesUniques = new HashSet<>();
                    List<FiltreDate> rdvItems = new ArrayList<>();

                    for (FiltreDateRequest d : filtreDates) {
                        String date = d.getJourRdv();
                        if (datesUniques.add(date)) {
                            rdvItems.add(new FiltreDate(date));
                            Log.d("API", "Date unique ajoutée : " + date);
                        }
                    }

                    messagePrAcuneDate.setVisibility(View.GONE);
                    listView.setVisibility(View.VISIBLE);

                    FiltreDateAdapter adapter = new FiltreDateAdapter(
                            PageFiltreDate.this,
                            rdvItems,
                            filtreDate -> {
                                Intent intent = new Intent(PageFiltreDate.this, PageFiltreHeure.class);
                                intent.putExtra("date", filtreDate.getJourRdv());
                                intent.putExtra("code_employe", codeEmploye);
                                intent.putExtra("token", token);
                                intent.putExtra("courriel", courriel);
                                startActivity(intent);
                            }
                    );
                    listView.setAdapter(adapter);

                } else {
                    Log.e("API", "Erreur HTTP: " + response.code());
                    Toast.makeText(PageFiltreDate.this, "Erreur de chargement des dates", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<FiltreDateRequest>> call, Throwable t) {
                Toast.makeText(PageFiltreDate.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                Log.e("API", "Erreur réseau", t);
            }
        });
    }




    @Override
    public void onClick(View view) {
        if (view == retour) {
            Intent intent = new Intent(PageFiltreDate.this, PageFiltrePersonnel.class);
            intent.putExtra("token", token);
            intent.putExtra("courriel", courriel);
            startActivity(intent);
            finish();
        }
    }
}
