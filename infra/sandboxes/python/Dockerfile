FROM python:3.12-slim

# Install ML/Data Science libraries
RUN pip install --no-cache-dir \
    numpy==1.26.4 \
    pandas==2.2.1 \
    scikit-learn==1.4.1.post1 \
    matplotlib==3.8.3 \
    seaborn==0.13.2 \
    scipy==1.12.0 \
    xgboost==2.0.3 \
    lightgbm==4.3.0 \
    statsmodels==0.14.1 \
    Pillow==10.2.0 \
    requests==2.31.0

# Create unprivileged user
RUN useradd -m -u 1000 sandbox
USER sandbox

WORKDIR /code

CMD ["python", "/code/solution.py"]
