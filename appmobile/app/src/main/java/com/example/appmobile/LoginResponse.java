package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

//Modèle de données pour la réponse de l'API lors de la connexion.
public class LoginResponse {
    @SerializedName("token")
    private String token;

    @SerializedName("COURRIEL")
    private String courriel;

    public String getToken() { return token; }
    public String getCourriel() { return courriel; }
}
