package com.example.appmobile.PagesRDV;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;

import com.example.appmobile.R;

import java.util.List;

public class HoraireAdapter extends ArrayAdapter<HoraireRdv> {

    private TextView nomService ;
    private TextView dateRdv ;

    private TextView heureRdv ;
    private Button btnPrendreRdv ;

    public interface OnPrendreRdvClickListener {
        void onClick(HoraireRdv horaire);
    }
    private final OnPrendreRdvClickListener listener;


    public HoraireAdapter(Context context, List<HoraireRdv> horaires, OnPrendreRdvClickListener listener) {
        super(context, 0, horaires);
        this.listener = listener;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        HoraireRdv horaire  = getItem(position);

        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.horaire_rdv, parent, false);
        }

        nomService = convertView.findViewById(R.id.nomService);
         dateRdv = convertView.findViewById(R.id.dateRdv);
        heureRdv = convertView.findViewById(R.id.heureRdv);
       btnPrendreRdv = convertView.findViewById(R.id.btnRdv);


        nomService.setText(horaire.getNomService());
        dateRdv.setText(horaire.getJourRdv());
        heureRdv.setText(horaire.getHeureRdv());

        btnPrendreRdv.setOnClickListener(v -> {
            if (listener != null) {
                listener.onClick(horaire);
            }
        });

        return convertView;
    }


}
