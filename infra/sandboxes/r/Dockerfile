FROM r-base:4.3.2

# Install common R packages for data science
RUN Rscript -e "install.packages(c('dplyr', 'ggplot2', 'tidyr', 'readr', 'stringr', 'lubridate', 'jsonlite', 'data.table'), repos='https://cran.rstudio.com/', quiet=TRUE)"

RUN useradd -m -u 1001 sandbox
USER sandbox

WORKDIR /code

CMD ["Rscript", "/code/solution.r"]
