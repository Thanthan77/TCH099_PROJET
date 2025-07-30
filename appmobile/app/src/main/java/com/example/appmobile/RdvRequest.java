package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class RdvRequest {

    @SerializedName("ID_SERVICE")
    private int idRdv;

    @SerializedName("JOUR")
    private String jourRdv;

    @SerializedName("HEURE")
    private String heureRdv;


    @SerializedName("COURRIEL")
    private String courriel;


    public int getIdRdv() {
        return idRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getHeureRdv() {
        return heureRdv;
    }

    public String getCourriel() {
        return courriel;
    }



}
