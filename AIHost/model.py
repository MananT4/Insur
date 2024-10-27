import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

filename = 'insurance.csv'
df = pd.read_csv(filename)
df.rename(columns = {'expenses':'charges'}, inplace = True)
df.drop(["region"], axis=1, inplace=True) 
df['sex'] = df['sex'].map(lambda s :1  if s == 'female' else 0)
df['smoker'] = df['smoker'].map(lambda s :1  if s == 'yes' else 0)
X = df.drop(['charges'], axis = 1)
y = df.charges

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state = 0)

random_forest_reg = RandomForestRegressor(n_estimators=400, max_depth=5, random_state=13)  
random_forest_reg.fit(X_train, y_train) 
def model_summary(model, model_name, cvn=20): # Default value for cvn = 20
    from sklearn.model_selection import cross_val_score
    scores = cross_val_score(model, X_train, y_train, cv=cvn, scoring='r2')
    print("Model: ", model_name)
    print("Average R2 score in CV: ", np.mean(scores))
    print("Std deviation in CV: ", np.std(scores))
    print("Min R2 score in CV: ", np.min(scores))
    print("Max R2 score in CV: ", np.max(scores))
    print("\n")
model_summary(random_forest_reg, "Random_Forest_Regression")
#joblib.dump(random_forest_reg, 'premium_model.joblib')