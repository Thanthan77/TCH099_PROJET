
package com.example.appmobile.basesedonnes;

import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.example.appmobile.pageinfogenerale;

public class DbUtil extends SQLiteOpenHelper {

        public DbUtil(pageinfogenerale context) {
            super(context, "clientContact.Db", null, 1);
        }

        @Override
        public void onCreate(SQLiteDatabase db) {

            String requeteCreation = "CREATE TABLE " + clientContact.PatientContract.TABLE_NAME + " (" +
                    clientContact.PatientContract.Colonnes.COURRIEL + " VARCHAR(30) PRIMARY KEY, " +
                    clientContact.PatientContract.Colonnes.PRENOM + " VARCHAR(30), " +
                    clientContact.PatientContract.Colonnes.NOM + " VARCHAR(30), " +
                    clientContact.PatientContract.Colonnes.MOT_DE_PASSE + " VARCHAR(30), " +
                    clientContact.PatientContract.Colonnes.NUM_TEL + " INT, " +
                    clientContact.PatientContract.Colonnes.NUM_CIVIQUE + " INT, " +
                    clientContact.PatientContract.Colonnes.RUE + " VARCHAR(30), " +
                    clientContact.PatientContract.Colonnes.VILLE + " VARCHAR(30), " +
                    clientContact.PatientContract.Colonnes.CODE_POSTAL + " VARCHAR(15), " +
                    clientContact.PatientContract.Colonnes.NO_ASSURANCE + " VARCHAR(20), " +
                    clientContact.PatientContract.Colonnes.DATE_NAISSANCE + " DATE)";

            db.execSQL(requeteCreation);
        }


        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

        }

    }