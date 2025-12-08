library(sf)
library(dplyr)
library(readODS)

dea <- st_read("public/map/DEA2014.geo.json")

lu_raw <- read_ods("public/data/geography-lookup-ward2014-to-dea2014-to-lgd2014-administrative-geographies-2016-v1.ods",
                   sheet = 1,
                   skip = 2)

lu_dea <- lu_raw %>%
  select(DEA_code = DEA2014,  # column names may vary slightly; see note below
         LGDCode  = LGD2014) %>%
  distinct(DEA_code, .keep_all = TRUE)

dea2 <- dea %>%
  left_join(lu_dea, by = "DEA_code")

# sanity check
dea2 %>% select(DEA, DEA_code, LGDCode) %>% head()

st_write(dea2, "public/map/DEA2014.geo.json", driver = "GeoJSON", append = TRUE)
