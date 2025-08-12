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

public class FiltreDateAdapter extends ArrayAdapter<FiltreDate>  implements View.OnClickListener{

    private TextView dateRdv ;
    private Button btnPrendreDate ;
    private final List<FiltreDate> filtreDates ;

    private final OnFiltreClickListener listener;
    public interface OnFiltreClickListener {
        void onClick(FiltreDate filtreDate);
    }


    public FiltreDateAdapter(@NonNull Context context, List<FiltreDate> filtreDates, OnFiltreClickListener listener) {
        super(context, 0, filtreDates);
        this.filtreDates = filtreDates;
        this.listener = listener;
    }

    @NonNull
    @Override
    public View getView(int position, View convertView, @NonNull ViewGroup parent) {
        FiltreDate filtreDate = getItem(position) ;
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.activity_filtre_date, parent, false);
        }

        dateRdv = convertView.findViewById(R.id.dateRdvFiltre) ;
        btnPrendreDate = convertView.findViewById(R.id.btnPrendreDate) ;

        if (filtreDate != null) {
            dateRdv.setText(filtreDate.getJourRdv());
            Log.d("DEBUG", "date affichée : " + dateRdv.getText());

            btnPrendreDate.setTag(filtreDate);
            btnPrendreDate.setOnClickListener(this);
        }


        return convertView;

    }

    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.btnPrendreDate) {
            FiltreDate filtreDate = (FiltreDate) view.getTag();

            Toast.makeText(getContext(),
                    "RDV le " + filtreDate.getJourRdv(),
                    Toast.LENGTH_SHORT).show();
            listener.onClick(filtreDate);
        }

    }
}

