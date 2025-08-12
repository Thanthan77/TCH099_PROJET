package com.example.appmobile.PagesRDV;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.example.appmobile.R;

import java.util.List;

public class FiltreHeureAdapter extends ArrayAdapter<FiltreHeure> implements View.OnClickListener{

    private TextView heureRdv ;
    private Button btnPrendreHeure ;
    private final List<FiltreHeure> filtreHeures ;

    private final OnFiltreClickListener listener;

    public interface OnFiltreClickListener {
        void onClick(FiltreHeure filtreHeure);
    }

    public FiltreHeureAdapter(@NonNull Context context, List<FiltreHeure> filtreHeures, OnFiltreClickListener listener) {
        super(context, 0, filtreHeures);
        this.filtreHeures = filtreHeures;
        this.listener = listener;
    }


    @NonNull
    @Override
    public View getView(int position, View convertView, @NonNull ViewGroup parent) {
        FiltreHeure filtreHeure = getItem(position) ;
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.activity_filtre_heure, parent, false);
        }
        heureRdv=convertView.findViewById(R.id.heureRdvFiltre) ;
        btnPrendreHeure=convertView.findViewById(R.id.btnPrendreHeure) ;

        if (filtreHeure != null) {
            heureRdv.setText(filtreHeure.getHeureRdv());
            Log.d("DEBUG", "heureRdv reçu : " + heureRdv );

            btnPrendreHeure.setTag(filtreHeure);
            btnPrendreHeure.setOnClickListener(this);
        }


        return convertView;
    }
    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.btnPrendreHeure) {
            FiltreHeure filtreHeure = (FiltreHeure) view.getTag();

            Toast.makeText(getContext(),
                    "RDV à " + filtreHeure.getHeureRdv(),
                    Toast.LENGTH_SHORT).show();
            listener.onClick(filtreHeure);
        }

    }
}
