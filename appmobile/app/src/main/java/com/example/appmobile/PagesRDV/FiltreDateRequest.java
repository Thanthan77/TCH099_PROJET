package com.example.appmobile.PagesRDV;
import com.google.gson.annotations.SerializedName;
public class FiltreDateRequest {

    @SerializedName("JOUR")
    private String jourRdv ;

    public String getJourRdv() {
        return jourRdv;
    }
}
