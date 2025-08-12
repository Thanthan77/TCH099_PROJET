package com.example.appmobile;

import com.google.gson.annotations.SerializedName;
//Modèle de données pour la requête de connexion.
public class LoginRequest {
    @SerializedName("COURRIEL")
    private String courriel;

    @SerializedName("MOT_DE_PASSE")
    private String motDePasse;

    public LoginRequest(String courriel, String motDePasse) {
        this.courriel = courriel;
        this.motDePasse = motDePasse;
    }

}
