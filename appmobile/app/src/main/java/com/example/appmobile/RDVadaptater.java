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

public abstract class RDVadaptater extends ArrayAdapter<RdvInfo> {


    TextView serviceRdv;
    EditText daterdv;
    EditText timeRdv;
    EditText emailRdv;
    Button annulerRdv;

    public interface AnnulerRdvClickListener {

        void onClick(RdvInfo rdv);


    }

    private final AnnulerRdvClickListener listener;

    public RDVadaptater(AnnulerRdvClickListener listener, List<RdvInfo> rdvList, Context context) {
        super(context, 0);
        this.listener = listener;

    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {

        RdvInfo rdv = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.activity_texteadaptater, parent, false);
        }


        serviceRdv = convertView.findViewById(R.id.textViewRdvService);
        daterdv = convertView.findViewById(R.id.editTextDateRdv);
        timeRdv = convertView.findViewById(R.id.editTextTimeRdv);
        emailRdv = convertView.findViewById(R.id.editTextTextEmailAddressRdv);
        annulerRdv = convertView.findViewById(R.id.buttonannulationduRdv);

        serviceRdv.setText(rdv.getTypeRdv());
        daterdv.setText(rdv.getJourRdv());
        timeRdv.setText(rdv.getHeureRdv());
        emailRdv.setText(rdv.getCourriel());


        annulerRdv.setOnClickListener(v -> {
            annulerRdv();
        });

        return convertView;
    }

    private void annulerRdv() {

        ApiService apiService = ApiClient.getApiService();

        Call<List<RdvRequest>> call = apiService.putAnnulerRdv();
        call.enqueue(new Callback<List<RdvInfo>>() {

            @Override
            public void onResponse(Call<List<RdvInfo>> call, Response<List<RdvInfo>> response) {
                if (response.isSuccessful()) {
                    List<RdvInfo> rdvList = response.body();
                } else {
                    Log.e("API", "Erreur dans la réponse : " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<RdvInfo>> call, Throwable t) {
                Log.e("API", "Erreur : " + t.getMessage());
            }


        }


;}}

// preparer la liste
//va sur pageservice
//
