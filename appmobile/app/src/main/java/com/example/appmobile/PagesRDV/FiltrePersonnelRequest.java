package com.example.appmobile.PagesRDV;
import com.google.gson.annotations.SerializedName;
public class FiltrePersonnelRequest {


    @SerializedName("CODE_EMPLOYE")
    private int codeEmploye ;


    @SerializedName("NOM_EMPLOYE")
    private String nomEmploye ;

    public int getCodeEmploye() {
        return codeEmploye;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }
}
