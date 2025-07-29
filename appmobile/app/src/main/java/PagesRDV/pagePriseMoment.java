package PagesRDV;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ListView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.R;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class pagePriseMoment extends AppCompatActivity {

    private ListView listView;
    private ApiService apiService;
    private int idService;
    private String nomService ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prise_moment);

        listView = findViewById(R.id.listeHoraire);
        apiService = ApiClient.getApiService();


        idService = getIntent().getIntExtra("id_service", -1);
        nomService= getIntent().getIntExtra("nom_service", nomService) ;

        if (idService == -1) {
            Toast.makeText(this, "ID de service invalide", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        chargerHoraires();
    }

    private void chargerHoraires() {
        Call<List<HoraireRequest>> call = apiService.getHoraire();

        call.enqueue(new Callback<List<HoraireRequest>>() {
            @Override
            public void onResponse(Call<List<HoraireRequest>> call, Response<List<HoraireRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<HoraireRequest> horaires = response.body();

                    HoraireAdapter adapter = new HoraireAdapter(
                            pagePriseMoment.this,
                            horaires,
                            idService,
                            horaire -> {
                                Intent intent = new Intent(pagePriseMoment.this, pagePriseConfirmation.class);
                                intent.putExtra("nom_service", horaire.getNomService(idService));
                                intent.putExtra("jour", horaire.getJourRdv());
                                intent.putExtra("heure", horaire.getHeureRdv());
                                startActivity(intent);
                            }
                    );

                    listView.setAdapter(adapter);
                } else {
                    Toast.makeText(pagePriseMoment.this, "Erreur chargement horaires", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<HoraireRequest>> call, Throwable t) {
                Toast.makeText(pagePriseMoment.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }


}
