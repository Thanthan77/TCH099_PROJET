package com.example.appmobile.PagesRDV;

import android.content.Intent;
import android.os.Bundle;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;


import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class pagePriseService extends AppCompatActivity implements View.OnClickListener {

    private Button btnGenerale;
    private Button btnGrossesse;
    private Button btnMaladieChronique;
    private Button btnDepistage;
    private Button btnVaccin;
    private Button btnLiquideCorps;
    private Button btnUrgencePasOuf;
    private TextView lienDeco ;
    private TextView lienProfil ;
    private TextView lienMesRdv ;

    private int idService ;


    private Map<String, Integer> serviceMap = new HashMap<>();
    private ApiService apiService;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_prise_service);
        btnGenerale = findViewById(R.id.btn_rdv1);
        btnGrossesse = findViewById(R.id.btn_rdv2);
        btnMaladieChronique = findViewById(R.id.btn_rdv3);
        btnDepistage = findViewById(R.id.btn_rdv4);
        btnVaccin = findViewById(R.id.btn_rdv5);
        btnLiquideCorps = findViewById(R.id.btn_rdv6);
        btnUrgencePasOuf = findViewById(R.id.btn_rdv7);
        lienDeco= findViewById(R.id.lienDeconnexion) ;
        lienProfil=findViewById(R.id.lienProfil) ;
        lienMesRdv=findViewById(R.id.lienMesRdv) ;

        btnGenerale.setOnClickListener(this);
        btnGrossesse.setOnClickListener(this);
        btnMaladieChronique.setOnClickListener(this);
        btnDepistage.setOnClickListener(this);
        btnVaccin.setOnClickListener(this);
        btnLiquideCorps.setOnClickListener(this);
        btnUrgencePasOuf.setOnClickListener(this);
        lienMesRdv.setOnClickListener(this);
        lienProfil.setOnClickListener(this);
        lienDeco.setOnClickListener(this);

        apiService = ApiClient.getApiService();

        loadServices();


    }

    private void loadServices() {
        Call<List<ServiceRequest>> call = apiService.getServices();

        call.enqueue(new Callback<List<ServiceRequest>>() {
            @Override
            public void onResponse(Call<List<ServiceRequest>> call, Response<List<ServiceRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (ServiceRequest service : response.body()) {
                        serviceMap.put(service.getNomService(), service.getIdService());
                    }
                } else {
                    Toast.makeText(pagePriseService.this, "Erreur chargement des services", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<List<ServiceRequest>> call, Throwable t) {
                Toast.makeText(pagePriseService.this, "Erreur API : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }


    @Override
    public void onClick(View view) {
        String nomService = null ;
        if (view == btnGenerale) {
            nomService = "Consultation générale";
        } else if (view == btnGrossesse) {
            nomService = "Suivi de grossesse";
        } else if (view == btnMaladieChronique) {
            nomService = "Suivi de maladies chroniques";
        } else if (view == btnDepistage) {
            nomService = "Dépistage ITSS";
        } else if (view == btnVaccin) {
            nomService = "Vaccination";
        } else if (view == btnLiquideCorps) {
            nomService = "Prélèvement sanguin / test urine";
        } else if (view == btnUrgencePasOuf) {
            nomService = "Urgence mineure";
        } else if (view == lienDeco) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        } else if (view == lienMesRdv) {
            startActivity(new Intent(this, PageMesRDV.class));
            finish();
            return;
        } else if (view == lienProfil) {

            startActivity(new Intent(this, PageProfil.class));
            finish();
            return;
        }


        if (nomService != null) {
            idService = serviceMap.getOrDefault(nomService, -1);
            pageSuivante(nomService);
    }
    }

        private void pageSuivante (String nomService) {
        if(idService == -1)  {
            Toast.makeText(this,"Service non disponible", Toast.LENGTH_SHORT).show();
            return;
        }
        Intent intent = new Intent (this,pagePriseMoment.class) ;
            intent.putExtra("id_service", idService);
            intent.putExtra("nomService", nomService);
            startActivity(intent);
        }
    }









