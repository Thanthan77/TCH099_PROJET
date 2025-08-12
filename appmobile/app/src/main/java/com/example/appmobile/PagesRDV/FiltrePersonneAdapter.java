package com.example.appmobile.PagesRDV;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.example.appmobile.R;

import org.w3c.dom.Text;

import java.util.List;

public class FiltrePersonneAdapter extends ArrayAdapter<FiltrePersonnel>  implements View.OnClickListener{

    private final List<FiltrePersonnel> personnels;
    private final OnFiltreClickListener listener;

    private TextView nomEmploye ;
    private Button btnPrendrePersonnel ;


    public interface OnFiltreClickListener {
        void onClick(FiltrePersonnel personnel);
    }
    public FiltrePersonneAdapter(@NonNull Context context, List<FiltrePersonnel> personnels, OnFiltreClickListener listener) {
        super(context, 0,  personnels);
        this.personnels = personnels;
        this.listener = listener;
    }

    @NonNull
    @Override
    public View getView(int position, View convertView, @NonNull ViewGroup parent) {
        FiltrePersonnel filtrePersonnel= getItem(position) ;


        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.activity_filtre_personnel, parent, false);
        }

        nomEmploye = convertView.findViewById(R.id.nomEmploye) ;
        btnPrendrePersonnel= convertView.findViewById(R.id.btnPrendrePersonnel) ;

        if (filtrePersonnel != null) {
            nomEmploye.setText(filtrePersonnel.getNomEmploye());

            btnPrendrePersonnel.setTag(filtrePersonnel);
            btnPrendrePersonnel.setOnClickListener(this);
        }


        return convertView;

    }

    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.btnPrendrePersonnel) {
            FiltrePersonnel filtrePersonnel = (FiltrePersonnel) view.getTag();

            Toast.makeText(getContext(),
                    "RDV avec  " + filtrePersonnel.getNomEmploye(),
                    Toast.LENGTH_SHORT).show();
            listener.onClick(filtrePersonnel);
        }


    }
}
