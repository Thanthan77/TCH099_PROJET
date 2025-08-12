package com.example.appmobile;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RDVadaptater extends ArrayAdapter<RdvInfo> {
    private TextView serviceRdv;
    private TextView dateRdv;
    private TextView timeRdv;
    private TextView medecinRdv;
    private Button annulerRdv;

    public interface AnnulerRdvClickListener {
        void onClick(RdvInfo rdv);
    }

    private final AnnulerRdvClickListener listener;

    public RDVadaptater(AnnulerRdvClickListener listener, List<RdvInfo> rdvList, Context context) {
        super(context, 0, rdvList);
        this.listener = listener;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        RdvInfo rdv = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.texteadaptater, parent, false);
        }

        serviceRdv = convertView.findViewById(R.id.nomService2);
        dateRdv = convertView.findViewById(R.id.dateRdv2);
        timeRdv = convertView.findViewById(R.id.heureRdv2);
        medecinRdv = convertView.findViewById(R.id.medecinRdv2);
        annulerRdv = convertView.findViewById(R.id.buttonAnnulerRdv);

        assert rdv != null;

        serviceRdv.setText(rdv.getNomService());
        dateRdv.setText(rdv.getJourRdv());
        timeRdv.setText(rdv.getHeureRdv());

        // Affichage direct sans string.xml
        medecinRdv.setText("Rendez-vous avec Mm(e)" + rdv.getMedecin());

        annulerRdv.setOnClickListener(v -> annulerRdv(rdv));
        return convertView;
    }

    private void annulerRdv(RdvInfo rdv) {
        ApiService apiService = ApiClient.getApiService();

        int numRdv = rdv.getNumRdv();
        Map<String, String> jsonBody = new HashMap<>();
        jsonBody.put("action", "cancel");
        Log.d("API_REQUEST", "Annulation du RDV id=" + numRdv + " avec body=" + jsonBody);

        Call<Void> call = apiService.putAnnulerRdv(numRdv, jsonBody);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    remove(rdv);
                    notifyDataSetChanged();
                    Log.d("API", "RDV annulé avec succès");
                    if (listener != null) {
                        listener.onClick(rdv);
                    }
                } else {
                    Log.e("API", "Erreur d'annulation : code " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API", "Erreur réseau : " + t.getMessage());
            }
        });
    }
}
