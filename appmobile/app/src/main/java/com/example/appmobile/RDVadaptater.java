package com.example.appmobile;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;

import java.util.List;

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

        medecinRdv.setText("Rendez-vous avec M(me). " + rdv.getMedecin());

        annulerRdv.setOnClickListener(v -> {
            if (listener != null) listener.onClick(rdv);
        });
        return convertView;
    }

}
