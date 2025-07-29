package PagesRDV;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.R;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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

    private String idService ;

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
                        serviceMap.put(service.getNom(), service.getIdService());
                        String nom = service.getNom();
                        int id = service.getIdService();

                        if (nom.equals("Consultation générale")) {
                            btnGenerale.setTag(id);
                        } else if (nom.equals("Suivi de grossesse")) {
                            btnGrossesse.setTag(id);
                        } else if (nom.equals("Suivi de maladies chroniques")) {
                            btnMaladieChronique.setTag(id);
                        } else if (nom.equals("Dépistage ITSS")) {
                            btnDepistage.setTag(id);
                        } else if (nom.equals("Vaccination")) {
                            btnVaccin.setTag(id);
                        } else if (nom.equals("Prélèvement sanguin / test urine")) {
                            btnLiquideCorps.setTag(id);
                        } else if (nom.equals("Urgence mineure")) {
                            btnUrgencePasOuf.setTag(id);

                        }
                        btnGenerale.setOnClickListener(pagePriseService.this);
                        btnGrossesse.setOnClickListener(pagePriseService.this);
                        btnMaladieChronique.setOnClickListener(pagePriseService.this);
                        btnDepistage.setOnClickListener(pagePriseService.this);
                        btnVaccin.setOnClickListener(pagePriseService.this);
                        btnLiquideCorps.setOnClickListener(pagePriseService.this);
                        btnUrgencePasOuf.setOnClickListener(pagePriseService.this);

                    }

                }
                else {
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
        idService = "null" ;
        if (view == btnGenerale) {
            idService = (String) btnGenerale.getTag() ;
        } else if (view == btnGrossesse) {
            idService = (String) btnGrossesse.getTag() ;
        } else if (view == btnMaladieChronique) {
            idService = (String) btnMaladieChronique.getTag() ;
        } else if (view == btnDepistage) {
            idService = (String) btnDepistage.getTag() ;
        } else if (view == btnVaccin) {
            idService = (String) btnVaccin.getTag() ;
        } else if (view == btnLiquideCorps) {
            idService = (String) btnLiquideCorps.getTag() ;
        } else if (view == btnUrgencePasOuf) {
            idService = (String) btnUrgencePasOuf.getTag() ;

        }
        if (Objects.equals(idService, "null")) {
            Toast.makeText(this, "Service non chargé", Toast.LENGTH_SHORT).show();

        }
        Intent intent = new Intent(this, pagePriseMoment.class);
        intent.putExtra("id_service", idService);
        startActivity(intent);



    }

}



