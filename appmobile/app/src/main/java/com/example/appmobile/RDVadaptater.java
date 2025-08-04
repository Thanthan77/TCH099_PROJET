package com.example.appmobile;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RDVadaptater extends ArrayAdapter<RdvInfo> {


    private TextView serviceRdv;
    private TextView daterdv;
    private TextView timeRdv;
    private Button annulerRdv;

    private int idService  ;



    public interface AnnulerRdvClickListener {

        void onClick(RdvInfo rdv);


    }

    private final AnnulerRdvClickListener listener;

    public RDVadaptater(AnnulerRdvClickListener listener, List<RdvInfo> rdvList, Context context) {
        super(context, 0,rdvList);
        this.listener = listener;

    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {

        RdvInfo rdv = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.text_adapter, parent, false);
        }




        serviceRdv = convertView.findViewById(R.id.nomService2);
        daterdv = convertView.findViewById(R.id.dateRdv2);
        timeRdv = convertView.findViewById(R.id.heureRdv2);
        annulerRdv = convertView.findViewById(R.id.buttonAnnulerRdv);


        daterdv.setText(rdv.getJourRdv());
        timeRdv.setText(rdv.getHeureRdv());

        idService = rdv.getTypeRdv() ;
        nomService(idService) ;


        annulerRdv.setOnClickListener(v -> annulerRdv(rdv));


        return convertView;
    }

    private void annulerRdv(RdvInfo rdv) {
        ApiService apiService = ApiClient.getApiService();

        int id = rdv.getIdRdv();

        Call<Void> call = apiService.putAnnulerRdv(id);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {

                    remove(rdv);
                    notifyDataSetChanged();
                    Log.d("API", "RDV annulé avec succès");
                } else {
                    Log.e("API", "Erreur d'annulation : " + response.code());
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("API", "Erreur réseau : " + t.getMessage());
            }
        });
    }

    private void nomService (int idService) {
        String serviceNom ;
        switch (idService){
            case 1:
                serviceNom = "Consultation générale";
                break;
            case 2:
                serviceNom = "Suivi de grossesse";
                break;
            case 3:
                serviceNom = "Suivi de maladies chroniques";
                break;
            case 4:
                serviceNom = "Dépistage ITSS";
                break;
            case 5:
                serviceNom = "Vaccination";
                break;
            case 6:
                serviceNom = "Prélèvement sanguin / test urinaire";
                break;
            case 7:
                serviceNom = "Urgence mineure";
                break;
            default:
                serviceNom = "Service inconnu";
                break;
        }
        serviceRdv.setText(serviceNom);

    }
}






