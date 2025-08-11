package com.example.appmobile.PagesRDV;

import android.content.Intent;
import android.content.SharedPreferences;
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

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class pagePriseService extends AppCompatActivity implements View.OnClickListener {

    private Button btnGenerale, btnGrossesse, btnMaladieChronique, btnDepistage, btnVaccin, btnLiquideCorps, btnUrgencePasOuf;
    private TextView lienDeco, lienProfil, lienMesRdv;
    private ApiService apiService;
    private String token;
    private String courriel;
    private List<ServiceRequest> services ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prise_service);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        token = prefs.getString("token", null);
        courriel = prefs.getString("courriel", null);

        btnGenerale = findViewById(R.id.btn_rdv1);
        btnGrossesse = findViewById(R.id.btn_rdv2);
        btnMaladieChronique = findViewById(R.id.btn_rdv3);
        btnDepistage = findViewById(R.id.btn_rdv4);
        btnVaccin = findViewById(R.id.btn_rdv5);
        btnLiquideCorps = findViewById(R.id.btn_rdv6);
        btnUrgencePasOuf = findViewById(R.id.btn_rdv7);

        lienDeco = findViewById(R.id.lienDeconnexion);
        lienProfil = findViewById(R.id.lienProfil);
        lienMesRdv = findViewById(R.id.lienMesRdv);

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
        setButtonsEnabled(false);
        loadServices();
    }

    private void loadServices() {
        Call<List<ServiceRequest>> call = apiService.getServices();
        call.enqueue(new Callback<List<ServiceRequest>>() {
            @Override
            public void onResponse(Call<List<ServiceRequest>> call, Response<List<ServiceRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    services=response.body() ;
                    setButtonsEnabled(true);
                } else {
                    Toast.makeText(pagePriseService.this, "Erreur chargement services (code: " + response.code() + ")", Toast.LENGTH_LONG).show();
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
        if (view == lienDeco) {
            deconnexion();
        } else if (view == lienMesRdv) {
            naviguer(PageMesRDV.class);
        } else if (view == lienProfil) {
            naviguer(PageProfil.class);
        } else {
            String nomService = getNomServicePourBouton(view);
            int idService= getIdService (nomService) ;

                if (idService !=  0) {
                    Intent intent = new Intent(this, pagePriseMoment.class);
                    intent.putExtra("id_service", idService);
                    intent.putExtra("token", token);
                    intent.putExtra("courriel", courriel);
                    startActivity(intent);
                } else {
                    Toast.makeText(this, "Service non encore chargé", Toast.LENGTH_SHORT).show();
                }
        }
    }

    private String getNomServicePourBouton(View view) {
        if (view == btnGenerale) return "Consultation générale";
        if (view == btnGrossesse) return "Suivi de grossesse";
        if (view == btnMaladieChronique) return "Suivi de maladies chroniques";
        if (view == btnDepistage) return "Dépistage ITSS";
        if (view == btnVaccin) return "Vaccination";
        if (view == btnLiquideCorps) return "Prélèvement sanguin / test urine";
        if (view == btnUrgencePasOuf) return "Urgence mineure";
        return null;
    }
    private int  getIdService (String nomService) {
        if (services == null || nomService == null) return -1;
        for (ServiceRequest service : services) {
            if (nomService.equals(service.getNomService())) {
            return service.getIdService();
            }
        }
        return -1;
    }

    private void naviguer(Class<?> destination) {
        Intent intent = new Intent(this, destination);
        intent.putExtra("token", token);
        intent.putExtra("courriel", courriel);
        startActivity(intent);
        finish();
    }

    private void deconnexion() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void setButtonsEnabled(boolean enabled) {
        btnGenerale.setEnabled(enabled);
        btnGrossesse.setEnabled(enabled);
        btnMaladieChronique.setEnabled(enabled);
        btnDepistage.setEnabled(enabled);
        btnVaccin.setEnabled(enabled);
        btnLiquideCorps.setEnabled(enabled);
        btnUrgencePasOuf.setEnabled(enabled);
    }
}
