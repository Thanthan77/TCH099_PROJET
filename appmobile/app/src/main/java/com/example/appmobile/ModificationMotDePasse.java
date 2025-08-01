package PagesProfil;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.ApiClient;
import com.example.appmobile.ApiService;
import com.example.appmobile.R;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ModificationMotDePasse extends AppCompatActivity {

    private EditText ancienMdp, nouveauMdp, confirmerMdp;
    private TextView btnRetour;
    private Button btnAppliquer;

    private String courrielPatient, token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_mdp);

        ancienMdp = findViewById(R.id.ancien_mdp);
        nouveauMdp = findViewById(R.id.nouveau_mdp);
        confirmerMdp = findViewById(R.id.confirmer_mdp);
        btnRetour = findViewById(R.id.btn_retour_profile);
        btnAppliquer = findViewById(R.id.btn_appliquer_changement);

        courrielPatient = getIntent().getStringExtra("courriel");
        token = getIntent().getStringExtra("token");

        btnRetour.setOnClickListener(v -> {
            Intent intent = new Intent(ModificationMotDePasse.this, PagesProfil.PageProfil.class);
            intent.putExtra("courriel", courrielPatient);
            intent.putExtra("token", token);
            startActivity(intent);
            finish();
        });

        btnAppliquer.setOnClickListener(v -> {
            String ancien = ancienMdp.getText().toString().trim();
            String nouveau = nouveauMdp.getText().toString().trim();
            String confirmation = confirmerMdp.getText().toString().trim();

            if (ancien.isEmpty() || nouveau.isEmpty() || confirmation.isEmpty()) {
                Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!nouveau.equals(confirmation)) {
                Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }

            Map<String, String> data = new HashMap<>();
            data.put("COURRIEL", courrielPatient);
            data.put("ANCIEN_MOT_DE_PASSE", ancien);
            data.put("NOUVEAU_MOT_DE_PASSE", nouveau);

            ApiService apiService = ApiClient.getApiService();
            Call<Void> call = apiService.updatePassword(data);

            call.enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(ModificationMotDePasse.this, "Mot de passe changé avec succès", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(ModificationMotDePasse.this, PagesProfil.PageProfil.class);
                        intent.putExtra("courriel", courrielPatient);
                        intent.putExtra("token", token);
                        startActivity(intent);
                        finish();
                    } else {
                        Toast.makeText(ModificationMotDePasse.this, "Erreur de mise à jour", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    Toast.makeText(ModificationMotDePasse.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
    }
}
