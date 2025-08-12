package com.example.appmobile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;

import androidx.appcompat.app.AppCompatActivity;

import java.util.HashMap;
import java.util.Map;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Écran de modification du mot de passe.
 * Le patient pourra modifier son mot de passe et pourra aussi
 * naviguer en arrière vers la page de profil. Une fois son mdp modifié,
 * il sera redirigé vers la page profil avec son mdp mis à jour.
 */
public class ModificationMotDePasse extends AppCompatActivity {
    //Références UI
    private EditText ancienMdp, nouveauMdp, confirmerMdp;
    private TextView btnRetour;
    private Button btnAppliquer;

    //Contexte de session/navigation
    private String courrielPatient, token;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_mdp);

        //Récupération des Views
        ancienMdp = findViewById(R.id.ancien_mdp);
        nouveauMdp = findViewById(R.id.nouveau_mdp);
        confirmerMdp = findViewById(R.id.confirmer_mdp);
        btnRetour = findViewById(R.id.btn_retour_profile);
        btnAppliquer = findViewById(R.id.btn_appliquer_changement);

        //Service API
        apiService = ApiClient.getApiService();

        //Données reçues (courriel/token)
        courrielPatient = getIntent().getStringExtra("courriel");
        token = getIntent().getStringExtra("token");

        //Lien vers la page de profil sans changement
        btnRetour.setOnClickListener(v -> {
            Intent intent = new Intent(ModificationMotDePasse.this, PageProfil.class);
            intent.putExtra("courriel", courrielPatient);
            intent.putExtra("token", token);
            startActivity(intent);
            finish();
        });

        //Bouton pour appliquer le changement de mot de passe
        btnAppliquer.setOnClickListener(v -> {
            String ancien = ancienMdp.getText().toString();
            String nouveau = nouveauMdp.getText().toString();
            String confirmation = confirmerMdp.getText().toString();

            //Valide si les champs sont remplis
            if (ancien.isEmpty() || nouveau.isEmpty() || confirmation.isEmpty()) {
                Toast.makeText(this, "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
                return;
            }

            //Message d'erreur si le nouveau mdp n'est pas identique au mdp de confirmation
            if (!nouveau.equals(confirmation)) {
                Toast.makeText(this, "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
                return;
            }

            //Corps de la requête
            Map<String, String> body = new HashMap<>();
            body.put("COURRIEL", courrielPatient);
            body.put("ANCIEN_MDP", ancien);
            body.put("NOUVEAU_MDP", nouveau);

            //Appel asynchrone
            Call<ResponseBody> call = apiService.changerMotDePasse(body);
            call.enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(ModificationMotDePasse.this, "Mot de passe changé avec succès", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(ModificationMotDePasse.this, PageProfil.class);
                        intent.putExtra("courriel", courrielPatient);
                        intent.putExtra("token", token);
                        startActivity(intent);
                        finish();
                    } else if (response.code() == 401) {
                        Toast.makeText(ModificationMotDePasse.this, "Ancien mot de passe incorrect", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(ModificationMotDePasse.this, "Erreur lors de la modification", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    Toast.makeText(ModificationMotDePasse.this, "Erreur réseau : " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        });
    }
}
