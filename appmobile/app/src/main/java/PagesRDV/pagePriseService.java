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
                        String nom = service.getNomService() ;
                        int id = service.getIdService() ;


                        serviceMap.put(nom, id);

                        switch (service.getNomService()) {
                            case "Consultation générale":
                                btnGenerale.setTag(service.getNomService());
                                break;
                            case "Suivi de grossesse":
                                btnGrossesse.setTag(service.getNomService());
                                break;
                            case "Suivi de maladies chroniques":
                                btnMaladieChronique.setTag(service.getNomService());
                                break;
                            case "Dépistage ITSS":
                                btnDepistage.setTag(service.getNomService());
                                break;
                            case "Vaccination":
                                btnVaccin.setTag(service.getNomService());
                                break;
                            case "Prélèvement sanguin / test urine":
                                btnLiquideCorps.setTag(service.getNomService());
                                break;
                            case "Urgence mineure":
                                btnUrgencePasOuf.setTag(service.getNomService());
                                break;
                        }


                    }



                btnGenerale.setOnClickListener(pagePriseService.this);
                btnGrossesse.setOnClickListener(pagePriseService.this);
                btnMaladieChronique.setOnClickListener(pagePriseService.this);
                btnDepistage.setOnClickListener(pagePriseService.this);
                btnVaccin.setOnClickListener(pagePriseService.this);
                btnLiquideCorps.setOnClickListener(pagePriseService.this);
                btnUrgencePasOuf.setOnClickListener(pagePriseService.this);
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
        String nomService = (String) view.getTag();
        idService = serviceMap.getOrDefault(nomService, -1);

        if (idService == -1) {
            Toast.makeText(this, "Service non trouvé", Toast.LENGTH_SHORT).show();
            return;
        }
        if (idService == -1) {
            Toast.makeText(this, "Service non chargé", Toast.LENGTH_SHORT).show();

        }
        Intent intent = new Intent(this, pagePriseMoment.class);
        intent.putExtra("id_service", idService);
        startActivity(intent);



    }

}



